"""CROMA architecture — vendored from https://github.com/antofuller/CROMA
(MIT License, Copyright (c) 2023 Anthony Fuller), file `use_croma.py`.

Module classes (ViT, BaseTransformer, BaseTransformerCrossAttn, Attention,
CrossAttention, FFN, get_2dalibi) are copied verbatim so the architecture
exactly matches the released checkpoint's state dict.

`PretrainedCROMA` differs from upstream: upstream's __init__ calls
`torch.load(pretrained_path)['s1_encoder']` etc., which expects a .pt file
containing separate per-submodule dicts. The checkpoint distributed for
this project (croma-base) is a single flat `model.safetensors` file (Hugging
Face `PyTorchModelHubMixin` format) holding all submodules' weights under
one state dict with keys like `s1_encoder.*`, `GAP_FFN_s1.*`, etc. — so
weight loading below is done once, after building all submodules, via
`load_state_dict` on the whole module instead of per-submodule torch.load.
"""
from __future__ import annotations

import itertools
import math

import torch
from einops import rearrange
from torch import einsum, nn


def get_2dalibi(num_heads, num_patches):
    points = list(itertools.product(range(int(math.sqrt(num_patches))), range(int(math.sqrt(num_patches)))))

    def get_slopes(n):
        def get_slopes_power_of_2(n):
            start = (2 ** (-2 ** -(math.log2(n) - 3)))
            ratio = start
            return [start * ratio ** i for i in range(n)]

        if math.log2(n).is_integer():
            return get_slopes_power_of_2(n)
        else:
            closest_power_of_2 = 2 ** math.floor(math.log2(n))
            return get_slopes_power_of_2(closest_power_of_2) + get_slopes(2 * closest_power_of_2)[0::2][
                                                               :n - closest_power_of_2]

    slopes = torch.Tensor(get_slopes(num_heads)).unsqueeze(1)
    idxs = []
    for p1 in points:
        for p2 in points:
            dist = math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)
            idxs.append(dist * slopes * -1)
    all_bias = torch.cat(idxs, dim=1)
    return all_bias.view(1, num_heads, num_patches, num_patches)


class FFN(nn.Module):
    def __init__(self, dim, mult=4, dropout=0.):
        super().__init__()
        inner_dim = int(dim * mult)
        self.net = nn.Sequential(
            nn.Linear(dim, inner_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(inner_dim, dim),
        )
        self.input_norm = nn.LayerNorm(dim)

    def forward(self, x):
        x = self.input_norm(x)
        return self.net(x)


class Attention(nn.Module):
    def __init__(self, dim, num_heads=8, dropout=0.):
        super().__init__()
        self.num_heads = num_heads
        assert dim % num_heads == 0, 'dim must be evenly divisible by num_heads'
        dim_head = int(dim / num_heads)
        self.scale = dim_head ** -0.5
        self.to_qkv = nn.Linear(dim, dim * 3, bias=False)
        self.to_out = nn.Linear(dim, dim)
        self.input_norm = nn.LayerNorm(dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, relative_position_bias):
        x = self.input_norm(x)
        q, k, v = self.to_qkv(x).chunk(3, dim=-1)
        q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h=self.num_heads), (q, k, v))
        attention_scores = einsum('b h i d, b h j d -> b h i j', q, k) * self.scale
        attention_scores = attention_scores + relative_position_bias
        attn = attention_scores.softmax(dim=-1)
        attn = self.dropout(attn)
        out = einsum('b h i j, b h j d -> b h i d', attn, v)
        out = rearrange(out, 'b h n d -> b n (h d)')
        return self.to_out(out)


class CrossAttention(nn.Module):
    def __init__(self, dim, num_heads=8, dropout=0.):
        super().__init__()
        self.num_heads = num_heads
        assert dim % num_heads == 0, 'dim must be evenly divisible by num_heads'
        dim_head = int(dim / num_heads)
        self.scale = dim_head ** -0.5
        self.to_q = nn.Linear(dim, dim, bias=False)
        self.to_k = nn.Linear(dim, dim, bias=False)
        self.to_v = nn.Linear(dim, dim, bias=False)
        self.to_out = nn.Linear(dim, dim)
        self.input_norm = nn.LayerNorm(dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, context, relative_position_bias):
        x = self.input_norm(x)
        context = self.input_norm(context)
        q = self.to_q(x)
        k = self.to_k(context)
        v = self.to_v(context)
        q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h=self.num_heads), (q, k, v))
        attention_scores = einsum('b h i d, b h j d -> b h i j', q, k) * self.scale
        attention_scores = attention_scores + relative_position_bias
        attn = attention_scores.softmax(dim=-1)
        attn = self.dropout(attn)
        out = einsum('b h i j, b h j d -> b h i d', attn, v)
        out = rearrange(out, 'b h n d -> b n (h d)')
        return self.to_out(out)


class BaseTransformer(nn.Module):
    def __init__(self, dim, depth, num_heads=8, attn_dropout=0., ff_dropout=0., ff_mult=4, final_norm=True):
        super().__init__()
        self.final_norm = final_norm
        self.layers = nn.ModuleList([])
        for _ in range(depth):
            self.layers.append(nn.ModuleList([
                Attention(dim=dim, num_heads=num_heads, dropout=attn_dropout),
                FFN(dim=dim, mult=ff_mult, dropout=ff_dropout),
            ]))
        if self.final_norm:
            self.norm_out = nn.LayerNorm(dim)

    def forward(self, x, relative_position_bias=False):
        for self_attn, ffn in self.layers:
            x = self_attn(x, relative_position_bias) + x
            x = ffn(x) + x
        if self.final_norm:
            return self.norm_out(x)
        return x


class BaseTransformerCrossAttn(nn.Module):
    def __init__(self, dim, depth, num_heads=8, attn_dropout=0., ff_dropout=0., ff_mult=4):
        super().__init__()
        self.layers = nn.ModuleList([])
        for _ in range(depth):
            self.layers.append(nn.ModuleList([
                Attention(dim=dim, num_heads=num_heads, dropout=attn_dropout),
                CrossAttention(dim=dim, num_heads=num_heads, dropout=attn_dropout),
                FFN(dim=dim, mult=ff_mult, dropout=ff_dropout),
            ]))
        self.norm_out = nn.LayerNorm(dim)

    def forward(self, x, context, relative_position_bias):
        for self_attn, cross_attn, ffn in self.layers:
            x = self_attn(x, relative_position_bias) + x
            x = cross_attn(x, context, relative_position_bias) + x
            x = ffn(x) + x
        return self.norm_out(x)


class ViT(nn.Module):
    def __init__(self, dim, depth, in_channels):
        super().__init__()
        self.depth = depth
        self.in_channels = in_channels
        self.dim = dim
        self.num_heads = 16
        self.patch_size = 8
        pixels_per_patch = int(self.patch_size * self.patch_size * in_channels)
        self.linear_input = nn.Linear(pixels_per_patch, self.dim)
        self.transformer = BaseTransformer(dim=self.dim, depth=self.depth, num_heads=self.num_heads)

    def forward(self, imgs, attn_bias):
        x = rearrange(imgs, 'b c (h i) (w j) -> b (h w) (c i j)', i=self.patch_size, j=self.patch_size)
        x = self.linear_input(x)
        x = self.transformer(x, relative_position_bias=attn_bias)
        return x


class PretrainedCROMA(nn.Module):
    """Same submodule layout/names as upstream `PretrainedCROMA`, but loads
    a single flat safetensors state dict instead of per-submodule torch.load."""

    def __init__(self, pretrained_path: str, size: str = 'base', modality: str = 'both', image_resolution: int = 120):
        super().__init__()
        assert size in ('base', 'large')
        assert modality in ('both', 'SAR', 'optical')
        assert image_resolution % 8 == 0

        if size == 'base':
            self.encoder_dim = 768
            self.encoder_depth = 12
        else:
            self.encoder_dim = 1024
            self.encoder_depth = 24
        self.num_heads = 16
        self.patch_size = 8

        self.modality = modality
        self.num_patches = int((image_resolution / 8) ** 2)
        self.s1_channels = 2
        self.s2_channels = 12
        self.register_buffer("attn_bias", get_2dalibi(num_heads=self.num_heads, num_patches=self.num_patches), persistent=False)

        if modality in ('SAR', 'both'):
            self.s1_encoder = ViT(dim=self.encoder_dim, depth=int(self.encoder_depth / 2), in_channels=self.s1_channels)
            self.GAP_FFN_s1 = nn.Sequential(
                nn.LayerNorm(self.encoder_dim),
                nn.Linear(self.encoder_dim, int(4 * self.encoder_dim)),
                nn.GELU(),
                nn.Linear(int(4 * self.encoder_dim), self.encoder_dim),
            )

        if modality in ('optical', 'both'):
            self.s2_encoder = ViT(dim=self.encoder_dim, depth=self.encoder_depth, in_channels=self.s2_channels)
            self.GAP_FFN_s2 = nn.Sequential(
                nn.LayerNorm(self.encoder_dim),
                nn.Linear(self.encoder_dim, int(4 * self.encoder_dim)),
                nn.GELU(),
                nn.Linear(int(4 * self.encoder_dim), self.encoder_dim),
            )

        if modality == 'both':
            self.cross_encoder = BaseTransformerCrossAttn(dim=self.encoder_dim, depth=int(self.encoder_depth / 2), num_heads=self.num_heads)

        state_dict = _load_flat_state_dict(pretrained_path)
        missing, unexpected = self.load_state_dict(state_dict, strict=False)
        real_missing = [k for k in missing if k != "attn_bias"]
        if real_missing:
            raise RuntimeError(f"CROMA checkpoint missing expected keys: {real_missing[:10]}")
        if unexpected:
            raise RuntimeError(f"CROMA checkpoint has unexpected keys: {unexpected[:10]}")

    def forward(self, SAR_images=None, optical_images=None):
        return_dict = {}
        if self.modality in ('SAR', 'both'):
            assert SAR_images is not None
            SAR_encodings = self.s1_encoder(imgs=SAR_images, attn_bias=self.attn_bias.to(SAR_images.device))
            return_dict['SAR_encodings'] = SAR_encodings
            return_dict['SAR_GAP'] = self.GAP_FFN_s1(SAR_encodings.mean(dim=1))

        if self.modality in ('optical', 'both'):
            assert optical_images is not None
            optical_encodings = self.s2_encoder(imgs=optical_images, attn_bias=self.attn_bias.to(optical_images.device))
            return_dict['optical_encodings'] = optical_encodings
            return_dict['optical_GAP'] = self.GAP_FFN_s2(optical_encodings.mean(dim=1))

        if self.modality == 'both':
            joint_encodings = self.cross_encoder(
                x=return_dict['SAR_encodings'], context=return_dict['optical_encodings'],
                relative_position_bias=self.attn_bias.to(optical_images.device),
            )
            return_dict['joint_encodings'] = joint_encodings
            return_dict['joint_GAP'] = joint_encodings.mean(dim=1)

        return return_dict


def _load_flat_state_dict(pretrained_path: str) -> dict:
    if pretrained_path.endswith(".safetensors"):
        from safetensors.torch import load_file
        return load_file(pretrained_path)
    return torch.load(pretrained_path, map_location="cpu")

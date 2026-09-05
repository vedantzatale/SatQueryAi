"""Loads model_registry/models.yaml -- the single source of truth for which
adapter satisfies which capability. Nothing else in the codebase should
hardcode a model name for routing purposes.
"""
from __future__ import annotations

import importlib
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import yaml

from app.model_adapters.base import BaseModelAdapter, ModelHealth

_REGISTRY_PATH = Path(__file__).resolve().parent / "models.yaml"


@dataclass
class RegistryEntry:
    model_id: str
    adapter_class_path: str | None
    capability: list[str]
    modalities: list[str]
    version: str
    fallback: str | None
    enabled: bool
    resource_requirement: str


class ModelRegistry:
    def __init__(self, entries: dict[str, RegistryEntry]) -> None:
        self._entries = entries

    def get(self, model_id: str) -> RegistryEntry | None:
        return self._entries.get(model_id)

    def all(self) -> list[RegistryEntry]:
        return list(self._entries.values())

    def for_capability(self, capability: str) -> list[RegistryEntry]:
        """Enabled entries offering `capability`, in the order declared in
        models.yaml (which is treated as priority order)."""
        return [e for e in self._entries.values() if e.enabled and capability in e.capability]


@lru_cache
def load_registry() -> ModelRegistry:
    with open(_REGISTRY_PATH, encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    entries: dict[str, RegistryEntry] = {}
    for model_id, spec in raw.get("models", {}).items():
        entries[model_id] = RegistryEntry(
            model_id=model_id,
            adapter_class_path=spec.get("adapter_class"),
            capability=spec.get("capability", []),
            modalities=spec.get("modalities", []),
            version=spec.get("version", "unknown"),
            fallback=spec.get("fallback"),
            enabled=bool(spec.get("enabled", True)),
            resource_requirement=spec.get("resource_requirement", "medium"),
        )
    return ModelRegistry(entries)


class ModelManager:
    """Lazy-loads and caches adapter instances by model_id. Drives health
    checks and fallback -- never a silent switch, always audit-logged by
    the caller using the returned `fallback_used`/`fallback_reason`."""

    def __init__(self) -> None:
        self._instances: dict[str, BaseModelAdapter] = {}

    def _instantiate(self, model_id: str) -> BaseModelAdapter:
        registry = load_registry()
        entry = registry.get(model_id)
        if entry is None or not entry.enabled or not entry.adapter_class_path:
            raise ValueError(f"Model '{model_id}' is not available in the registry.")
        module_path, class_name = entry.adapter_class_path.rsplit(".", 1)
        module = importlib.import_module(module_path)
        adapter_class = getattr(module, class_name)
        instance: BaseModelAdapter = adapter_class()
        instance.load()
        return instance

    def get_model(self, model_id: str) -> BaseModelAdapter:
        if model_id not in self._instances:
            self._instances[model_id] = self._instantiate(model_id)
        return self._instances[model_id]

    def get_for_capability(self, capability: str) -> tuple[BaseModelAdapter, bool, str | None]:
        """Returns (adapter, fallback_used, fallback_reason). Tries entries
        for `capability` in registry priority order; falls back only to an
        entry explicitly named as `fallback` in models.yaml, and only when
        the primary reports UNAVAILABLE."""
        registry = load_registry()
        candidates = registry.for_capability(capability)
        if not candidates:
            raise ValueError(f"No enabled model provides capability '{capability}'.")

        primary = candidates[0]
        primary_adapter = self.get_model(primary.model_id)
        if primary_adapter.health_check() != ModelHealth.UNAVAILABLE:
            return primary_adapter, False, None

        if primary.fallback:
            fallback_adapter = self.get_model(primary.fallback)
            if fallback_adapter.health_check() != ModelHealth.UNAVAILABLE:
                return (
                    fallback_adapter,
                    True,
                    f"Primary model '{primary.model_id}' unavailable. "
                    f"Approved fallback model '{primary.fallback}' was used.",
                )

        raise RuntimeError(
            f"Model '{primary.model_id}' for capability '{capability}' is unavailable "
            "and no healthy fallback is configured."
        )


_manager = ModelManager()


def get_model_manager() -> ModelManager:
    return _manager

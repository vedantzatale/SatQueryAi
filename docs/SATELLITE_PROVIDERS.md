# Satellite data providers

`app/satellite/providers/base.py` defines `SatelliteDataProvider`: `search_scenes()`,
`get_metadata()`, `download_scene()`, `check_availability()`. `ProviderManager`
(`app/satellite/provider_manager.py`) is the only caller — the agent never talks to a
provider directly (see `docs/ARCHITECTURE.md`).

| Provider | Status in this build | Activate via |
|---|---|---|
| Copernicus Data Space Ecosystem (Sentinel-1/2) | Real OAuth2 + OData catalogue search client. `download_scene()` is a documented stub — direct product download needs a dedicated worker and is flagged as not implemented rather than faked. | `COPERNICUS_CLIENT_ID` + `COPERNICUS_CLIENT_SECRET` |
| ISRO/NRSC Bhoonidhi | Placeholder — reports `"Bhoonidhi access is not configured in this deployment."` Bhoonidhi has no public open API comparable to Copernicus's, so this stays a placeholder until real access is arranged. | `BHOONIDHI_API_URL` + `BHOONIDHI_API_KEY` (still returns "not implemented" even when set — see code comment) |
| USGS EarthExplorer/Landsat | Real M2M API availability check. Scene search is a documented follow-up (`search_scenes()` returns `[]` even when the API is reachable). | `USGS_API_KEY` |
| Mock/demo provider | Serves the synthetic dataset from `data/demo/metadata/manifest.json`. Only used when `DEMO_MODE=true` and every real provider above is unavailable. Every scene it returns has `demo_mode: true` and `sensor: "synthetic_demo"` — never presented as real satellite data. | Always available in demo mode; run `scripts/generate_demo_data.py` first |

Priority order is `SATELLITE_PROVIDER_PRIORITY` (default `copernicus,bhoonidhi,usgs`).
`ProviderManager.search_scenes()` tries each in order, skips ones reporting
`unavailable_no_credentials`/`unavailable_error`, and only falls through to the mock
provider after every configured real provider has been tried and failed.

## Scene ranking

`app/satellite/scene_ranker.py` scores single scenes on modality/cloud/quality/resolution/
CRS/sensor/provider-availability, and — for bi-temporal requests — scores **pairs**
(before × after combinations), never picking the two temporally-nearest scenes
independently. See `docs/ARCHITECTURE.md` for the full scoring breakdown and
`backend/tests/test_scene_ranker.py` for the behavior this guarantees (never just the
first result; temporal incompatibility returns no pair rather than a bad one).

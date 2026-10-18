# RC45 K=300 matrix — GitHub Mission Control integration

Target repository: https://github.com/mlowe484/GAD-Mission-Control

The existing public GAD Mission Control V6 uses `index.html` as a bootstrapper, a bundled `v3.html` viewer with four frozen RC42 missions, and V4–V6 visual patches. Its `v3.html` contains an `embeddedFlightData` JSON block and a hardcoded four-entry `MANIFEST`. **Do not replace or relabel these RC42 records as RC45.**

## Drop-in standalone progress dashboard (recommended)

Copy the **contents of `site_data/`** from the `RC45_GITHUB_PAGES_READY_*.zip` package to a new `rc45/` directory in your GitHub Pages repository. The resulting layout is:

```
rc45/
  index.html           # Responsive 32-route results and flight-track viewer
  manifest.json        # All route statuses, hash-linked certificates, search coverage
  routes/
    earth_moon.json    # Only routes with independently certified mission replays
    ...
  references/
    index.json
    rc45_pilot_jupiter_neptune.json  # Separate prior pilot, not counted in matrix
```

After GitHub Pages deploys the files, open `https://<user>.github.io/GAD-Mission-Control/rc45/` (depending on the repository's configured Pages URL). Optionally add a link to `./rc45/` from the main `index.html`. The dashboard needs no third-party JavaScript frameworks or build step.

The UI shows a status for each of the 32 original inner/outer benchmark routes. It **never** draws a simulated flight path for an unresolved mission, and does not equate search-budget exhaustion with physical infeasibility. Its reconstructed trajectories use the original command history with an independent numerical propagation pass. The full mission certificates and untouched original commands are preserved in the separate engineering/evidence archive.

## Native incorporation into the main V6 viewer (optional next integration)

To make all RC45 flights directly selectable in the older V6 full-flight interface, use the `manifest.json` index and fetch only verified `routes/{route}.json` files. Each route payload is compatible with the legacy object shape:

- `meta`: route, timing, body constants, verification status, source SHA, stage boundaries;
- `states`: array of `[flight_t_s, spacecraft_x_km, spacecraft_y_km, vx_kms, vy_kms, source_x_km, source_y_km, destination_x_km, destination_y_km, source_altitude_km, distance_to_destination_center_km, destination_altitude_km, radial_velocity_kms, tangential_velocity_kms, stage_code]`;
- `commands`: array of `[flight_t_s, enabled, target_body, K, theta_deg, phi_deg, stage_code]`;
- `decisions`: currently empty in the viewer adapter; the full original decision log is in the engineering evidence.

`states` and displayed `commands` use **launch-relative** time (first sample at `t=0`), while the exact original command history and initial epoch remain in the engineering archive. `meta.launch_epoch_s` holds the absolute source-ephemeris launch epoch. The 15-field viewer state arrays are numerical reconstructions from archived commands. They are not the controller's original sampled states, and *their reconstruction is not the independent certification audit*.

In V6, `v6GetBodyPositions(t)` currently assumes every route has an entry in `GAD_V6_NAV_DATA.routes[M.id]`. For newly added RC45 routes, use the fallback `M.launch_epoch_s`, or add a corresponding route entry to the nav data. Do not use the visual reconstruction to certify physics or to seed a new flight.

The existing `v3.html` declares `EMBEDDED` and `MANIFEST` inside its own IIFE. Simply dropping JSON files into `data/` will **not** add them to that selector; change the loader to fetch RC45 JSON lazily and use revision-prefixed selector values. The included standalone `rc45/index.html` avoids modifying this frozen viewer in the first release.

## Updating when additional cells finish

Keep the full source tree unchanged while using the checkpointed scheduler; a source change must create a new evidence lineage. Rerun the provided export script with the `--root` and `--extra-root` campaign paths (see the engineering archive) and replace only the RC45 `rc45/` page data. The source hash and status summaries are embedded in the manifest.

Do not publish the entire `evidence/` directory or source-controller archive unless intentionally exposing the raw engineering artifacts. The site-data ZIP is enough for a public visual progress page.

## Important boundaries

The historical 319.7995-day Jupiter → Neptune mission is independently certified but came from an earlier RC45 pilot. It appears under `references/`, with its own provenance, and must **not** be counted as a success in this separate 32-route regression unless the current matrix itself produces a valid independent certificate for that route. No route is marked impossible merely because its search trials were unresolved.
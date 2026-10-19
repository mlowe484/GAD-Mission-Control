# GAD Mission Control V7 — Revision-independent replay archive

The website is a **generic replay viewer**: it does not execute the GAD simulator or depend on a specific controller implementation. The controller revision and source evidence belong to a **replay record**, not to a route name or the site code.

## Replay identity and provenance

Use a stable key `route@revision` (for example `earth_mercury@RC42` or `earth_mercury@RC44`). A route can have multiple controller revisions; different revisions must never share trajectory, command, or verification records. Each replay contains:

- `schema_version: "gad-replay-v1"`
- `meta.id`, `meta.source`, `meta.destination`, `meta.revision`, `meta.controller_build`, `meta.replay_id`
- `meta.source_evidence`: benchmark archive name and SHA-256 digests of trajectory, command, result and optional audit inputs
- `meta.verification`: status and whether full command replay and GAD-off capture were verified in the archived result
- `meta.epoch_start_s`: model time of the first recorded command (needed to synchronize gravity and ephemerides)
- `meta.data_quality`: recorded/derived origin of each visualization
- `states`: ordered time-relative trajectory samples in heliocentric XY kilometers / km/s, with body positions and target-relative velocity
- `commands`: ordered time-relative records `[t_s, enabled (0/1), target_body, K, theta_deg, phi_deg, stage_id]`
- `decisions`: only decisions with actual, traceable timestamps; `untimed_decisions` retains stage/status of untimestamped archival decisions without inventing times

A revision ID is metadata, not a switch in the importer. The schema stays the same for RC42, RC43, RC44, RC45 or later, **provided the inputs are mapped to this interface**. Export differences are handled using `--column-map` and `--stage-map`, not revision-specific source-code branches. The CLI supports SI or kilometer coordinates and SI or km/s velocities.

### Important safety/data-integrity restrictions

- The importer **does not certify** a new run. It merely transports evidence from original archive results; verification flags must originate from the matching revision's original result/audit records.
- The `verified` status in the public catalog is applied only after auditing the bundled certified archive. Manually imported local JSON is shown as **not independently certified by the website** even if it self-reports success.
- Never substitute a saved forecast, coupled-mass centroid, or capture certificate from a different revision. V7 intentionally disables RC42-only forecast/centroid overlays when showing RC44 routes.
- Stage 0 prelaunch and post-shutdown continuations remain **derived illustrations** rather than recorded post-shutdown trajectory samples.
- For a future **3D** or incompatible physical model, define a separate adapter/model schema instead of silently dropping Z or changing physical meaning.
- No private controller source code is needed or published. Only normalized replay telemetry and provenance are part of the public site.

## Import a controller revision

Example using an RC44 evidence folder, after extracting its original files:

```bash
python tools/import_replay.py \
  --revision RC44 \
  --controller-build RC44-frozen \
  --route earth_mars --source Earth --destination Mars \
  --trajectory /path/to/trajectory_samples.csv \
  --commands /path/to/commands.json \
  --decisions /path/to/decisions.json \
  --result /path/to/result.json \
  --audit /path/to/independent_audit.json \
  --benchmark GAD_RC44_FROZEN_FULL_32_OF_32_2026-10-18.zip \
  --output site/replays/RC44/earth_mars.json
```

For a new revision with different stage names, supply a `stage-map.json` such as `{"OUTBOUND_BURN":1,"SETTLE":2,"COAST":3,"BRAKE_AND_INSERT":4}` and use `--stage-map`. Column remaps are supplied as `{"time":"epoch_sec","x":"craft_pos_x_km",...}` with `--column-map`, together with `--distance-unit km` and/or `--velocity-unit kms` if necessary.

Verify the resulting JSON record and its evidence before adding a catalog entry. Add an entry to `site/replays/catalog.json`, for example:

```json
{
  "route": "earth_mars",
  "revision": "RC45",
  "replay_id": "earth_mars@RC45",
  "label": "Earth → Mars",
  "file": "replays/RC45/earth_mars.json",
  "verified": false,
  "benchmark": "RC45 working replay — awaiting independent certification"
}
```

Commit only the normalized JSON and updated catalog to GitHub Pages. The revision selector automatically populates from the catalog. For an immediate, private test you can choose **Import replay JSON** in the viewer. That loads a normalized JSON directly in your browser session: no upload or GitHub change occurs; reload removes the session record.

## Included demonstration

- RC42 legacy: Earth→Mercury, Mars→Mercury, Jupiter→Neptune, Saturn→Neptune. Their previously published replay evidence is preserved.
- RC44 imported: Earth→Mercury, Earth→Mars. Both have recorded states/commands and a matching certified RC44 result. The RC42/RC44 Earth→Mercury switch is fully exercised.
- Full frozen RC44 evidence is preserved separately; the public site does **not** include simulator/controller Python source.

## Browser tests

`tools/test_browser.py` runs the V7 viewer in Chromium at desktop and 390px mobile widths, tests the revision selector, route switching, RC44 command counts and forecast gating, returns to RC42, and checks for runtime errors. It uses the original local source data and does not download content from the web.
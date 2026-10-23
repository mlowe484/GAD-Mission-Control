# V10.3 — Stability and playback release

**Scope:** Website-only. V10.2 JPL native moon data, RC42/RC44 flight telemetry, existing challenge physics and stored verification evidence remain unchanged.

## User-facing changes

- Replay transport controls: restart and jump ±5% of the displayed replay.
- Keyboard shortcuts for the 2D replay only when that tab is active, avoiding interference with Pilot Challenge controls.
- Pauses 2D replay, Pilot physics stepping and 3D ephemeris playback when the browser tab becomes hidden.
- Explicit V10.3 release identification.
- Helpful error reporting for missing resources, rather than a dead link to a retired version page.

## Engineering stability

- A small production `index.html` and separately versioned `assets/bootstrap-v10-3.js`.
- Explicit source/module ordering in `assets/release-manifest.json`.
- Automated structure tests to catch missing sources, incorrect V9 private-scope ordering, removed rollback links, and unintended duplicate production entrypoints.
- Original shared GitHub Pages URL remains the only version entry point.

## Limitations and follow-ups

The underlying viewer still carries historical patch-based architecture; complete bundling or ES-module migration would require detailed numerical and browser regression verification. Retain the source validation firewall before any such refactor. The 3D reference-spacecraft orbit is illustrative; certified 3D GAD mission telemetry has not yet been imported.

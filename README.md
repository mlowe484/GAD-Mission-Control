# GAD Mission Control

A public interactive visualization of **hypothetical** Gravity Aperture Drive flight replays using frozen RC42 simulation evidence. This website is not evidence of working antigravity hardware.

## V5 features

- Four selectable missions: Earth → Mercury, Mars → Mercury, Jupiter → Neptune, Saturn → Neptune.
- Recorded aperture direction θ and half-opening angle φ, with recomputed intercepted mass centroid and mass fraction.
- Flight director explanations keyed to the recorded controller stages and navigation timeline.
- Optional velocity, GAD repulsion, and single-body gravity direction arrows.
- Capture dashboard: target-relative radial/tangential speed and instantaneous osculating **two-body** periapsis, apoapsis, eccentricity and energy estimates.
- Stage 0 and the post-shutdown orbit are derived visualization segments, not archived powered flight states.
- Independent replay/capture verification remains a separate result from the illustrative flight display.

## Data integrity

Recorded flight commands and sampled states originate from the frozen RC42 benchmark. For mobile playback, the long unpowered coast may be sampled more sparsely while retaining powered departure and capture keyframes. The additional GAD estimates are derived from recorded commands and recomputed mass centroids. The GAD magnitude is the *uncapped* formula, not a measured acceleration or a certified flight state. Gravitational acceleration plotted is the Newtonian contribution of the named nearby body, not a full N-body total. The orbit diagnostic is target-centered, instantaneous, and two-body only. None of these visual diagnostics modify the frozen simulation or independently replayed certification.

The public website is deployed via GitHub Pages from the root of the main branch. The V4.2 viewer is preserved as `v4-2.html` for rollback.

## RC45 regression atlas

[Open the RC45 32-route regression atlas](https://mlowe484.github.io/GAD-Mission-Control/rc45/).

RC45's October 18, 2026 three-pass checkpoint independently verified **13 of 32** routes in **96 of 576** planned search cells; **19 remain unresolved** within the sampled search budget, not physically ruled out. The RC45 atlas includes the 13 certified interactive trajectory replays, 32-route status index, recorded aperture command data, a separate earlier independently certified 319.7995-day Jupiter → Neptune reference, and an explicit distinction between simulation visualization and independent verification. Data files are carried in a losslessly compressed browser-readable archive under `rc45/payload_*.b64`. Original RC42 V6 material is unchanged. See [`rc45/REGRESSION_REPORT.md`](rc45/REGRESSION_REPORT.md) and [`rc45/route_summary.csv`](rc45/route_summary.csv).

## V8 welcome and interactive learning lab

The latest `index.html` includes a collapsible welcome guide and an interactive 2D demonstration of K, aperture axis θ, cone half-angle φ, coupling-body selection, mass coverage, and modeled repulsive acceleration. This educational simulation is not a certified flight replay. The independent, revision-indexed historical replay library remains accessible below the guide; the prior V7.1 homepage is preserved as `v7-1.html`.

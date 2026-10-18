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

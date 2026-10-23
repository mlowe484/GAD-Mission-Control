# GAD Mission Control — V10.4

**Public website:** https://mlowe484.github.io/GAD-Mission-Control/

This is the **single public production entry point**. Previous public `vN.html` entry pages were retired. The website is an educational visualization of **hypothetical Gravitational Aperture Drive physics**, not evidence of a functioning real device.

## Four main experiences

- **Learn:** the aperture, K strength, axis θ, half-opening angle φ, coupled mass centroid and educational examples.
- **2D Missions:** revision-indexed archived simulation replays. The site catalog contains 29 distinct routes and 31 route/revision records (RC42 and RC44). Results and replay verification belong to each source revision, not to the viewer.
- **3D Explorer:** ten-year frozen P6F JPL/Horizons 31-body planetary/moon reference; twenty optional moons use native-cadence state samples with archived velocities and Hermite interpolation. The optional spacecraft is a derived illustration, not a verified 3D GAD mission.
- **Pilot Challenge:** five educational orbital tasks using a simplified Newtonian + GAD teaching model. Success indicators are teaching criteria, not independent controller certification.

## What changed in V10.3

1. Extracted the production bootstrap from `index.html` to `assets/bootstrap-v10-3.js`; the four experience modules and their immutable source archives remain distinct.
2. Added `assets/release-manifest.json` to document module loading order, provenance and the private V9 extension boundary.
3. Fixed cross-tab keyboard interaction: 2D replay arrow keys no longer interfere with Pilot controls.
4. Added replay jump-back/jump-forward/restart buttons. Changing tabs and hiding the browser window stops autoplay instead of continuing to simulate invisibly.
5. Named missing startup resources in the error display instead of linking to an obsolete historical page.
6. Added versioned release documentation and a repeatable structural regression check.

**Important:** the website still uses a compatibility layer to assemble the frozen V3–V10 engine modules at startup. This release organizes and guards that layer; it does **not** pretend those modules have been fully rewritten as independent ES modules. More invasive extraction should be a separately qualified change.

## Data integrity

The source packages, historical commands/flight states, numerical simulation equations and original P6F ephemeris have not been changed by V10.3. Distinguish **recorded** telemetry from interpolated ephemeris, **recomputed** force/orbit estimates and **illustrative** pilot/reference-spacecraft motions. 2D archived certificates do not certify any 3D GAD mission.

## Developer verification

Run `python3 -m unittest discover -s tests -v` for the release structure and source-loading contract. The viewer's browser smoke check must also exercise all four tabs, revision switching, 3D moons, keyboard focus, and Pilot scenario resets at desktop and phone widths.

Release manifest: `assets/release-manifest.json`. Release notes: `docs/RELEASE_V10_3.md`.

## V10.4 subsystem explorer

- Presets for the Solar System, Earth–Moon, Mars, Jupiter, Saturn, Uranus and Neptune.
- Select and follow individual moons; optionally freeze camera focus while the bodies continue moving.
- Change body-relative orbit-trail length (¼ to four orbital periods) or hide trails, and choose top, angled or edge-on camera views.
- Show derived JPL-state parent-relative distance, speed, instantaneous two-body orbital period, and inclination relative to the J2000 inertial XY plane.
- Restore lazy loading of the native-cadence 20-moon P6F archive from the existing split files; fall back transparently if unavailable.
- Preserve 2D certified replays, educational Pilot physics, and the original single public homepage.

Deployment entry: `index.html` → `assets/bootstrap-v10-4.js` → `v10-4-subsystem-explorer.patch.js`. The three guarded trail/follow rendering hooks are applied to the existing V10.1 view during startup. V10.4 does not certify new orbital elements or 3D GAD missions.

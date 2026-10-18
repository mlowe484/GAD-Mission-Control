# RC45 K ≤ 300 — 32-route physical search regression checkpoint

Date: 2026-10-18 (UTC)
Controller executing-source SHA256: `d6d931a03aec2b37bf0c15cde5dd32426b7afe4e458b834292434e91c6c0acc5`

## Outcome

**13/32 distinct routes independently verified. 19/32 remain unresolved within sampled search budgets.**

This campaign attempted **all 32 original baseline routes** across three distinct search cells each (96 fresh attempts), but it has **not** passed the frozen RC44 32/32 standard. It is a checkpoint, not a declaration of physical infeasibility or a globally optimized arrival map. The frozen RC42/RC43/RC44 data remains unchanged.

- Software regression suite: **191/191 passed**.
- Baseline nominal profile, launch epoch 0–90 days, 40s coarse search: 32 cells; 3 distinct certified routes.
- Baseline nominal profile, launch epoch 90–180 days, 40s coarse search: +32 cells; 4 distinct certified routes total.
- 75% requested departure excess-speed profile, launch epoch 0–90 days, 100s coarse search, departure K fraction 1.0, physical hardware Kmax 300: +32 cells; **13 distinct certified routes total**.
- Completed search cells: **96 of 576 configured search cells** (3 of 18 per route).
- Independent website reconstruction from archived exact controls: **9,608 spacecraft states, 18,010 original commands** across 13 newly certified routes; validation passed.

## Certified current-campaign routes

| Route | Wait (days) | Flight (days) | Arrival since benchmark epoch (days) |
|---|---:|---:|---:|
| Earth → Moon | 0.000 | 0.212 | **0.2124** |
| Moon → Earth | 0.000 | 0.225 | **0.2249** |
| Venus → Mercury | 0.000 | 21.496 | **21.4963** |
| Moon → Venus | 22.500 | 29.775 | **52.2747** |
| Earth → Venus | 45.000 | 7.301 | **52.3012** |
| Mars → Venus | 22.500 | 41.992 | **64.4922** |
| Earth → Mars | 45.000 | 26.730 | **71.7296** |
| Mars → Earth | 45.000 | 28.256 | **73.2556** |
| Venus → Moon | 40.000 | 36.468 | **76.4680** |
| Venus → Mars | 45.000 | 33.207 | **78.2073** |
| Moon → Mars | 45.000 | 72.033 | **117.0330** |
| Saturn → Uranus | 67.500 | 139.139 | **206.6393** |
| Saturn → Neptune | 0.000 | 286.270 | **286.2699** |

## Still unresolved after three cells per route

Earth → Mercury, Jupiter → Neptune, Jupiter → Saturn, Jupiter → Uranus, Mars → Mercury, Mars → Moon, Mercury → Earth, Mercury → Mars, Mercury → Moon, Mercury → Venus, Moon → Mercury, Neptune → Jupiter, Neptune → Saturn, Neptune → Uranus, Saturn → Jupiter, Uranus → Jupiter, Uranus → Neptune, Uranus → Saturn, Venus → Earth.

## Physical trial outcome taxonomy

96 completed physical search attempts are distributed as follows:

| Physical attempt result | Attempts |
|---|---:|
| `RC45_CELL_UNRESOLVED_NO_ADMISSIBLE_INTERCEPT` | 73 |
| `VERIFIED_ROUTE` | 18 |
| `SEARCH_EXHAUSTED` | 3 |
| `ENCOUNTER_ONLY` | 1 |
| `NOMINAL_ROUTE` | 1 |

- `RC45_CELL_UNRESOLVED_NO_ADMISSIBLE_INTERCEPT`: coarse intercept search did not produce an admissible new flight.
- `SEARCH_EXHAUSTED`: search allocation exhausted; not a physical impossibility finding.
- `ENCOUNTER_ONLY`: promising encounter without a completed and certified orbital mission.
- `NOMINAL_ROUTE`: live flight reached Neptune with a successful GAD-off orbit audit, but did not finish independent replay certification.
- `VERIFIED_ROUTE`: finite GAD departure, navigation and capture, GAD-off two-revolution orbit, independently replayed full commands, and source-bound certificate all passed.

## Critical Jupiter → Neptune replay-budget finding

The present 75%-speed Jupiter → Neptune rerun reported **319.799273 days** and a live GAD-off audit showing roughly 987.494–1012.900 km Neptune orbital altitude. But its independent audit returned `AUDIT_BUDGET_EXHAUSTED` (`clearance scan budget`); independent orbital replay completion was not demonstrated in that attempt. Its matrix status is **not verified**.

The earlier separate Jupiter → Neptune pilot remains independently certified at **319.799502732075 days** with a complete source-bound independent replay. It is included in website `references/` for viewing but is **not counted** among this campaign’s 13 passes. Both are bound to the same executing source SHA256.

This suggests replay-audit CPU contention or per-audit wall-budget sensitivity and should be investigated before wide parallel certification. An audit timeout must not be reinterpreted as either a physical failure or a success.

## Controller configuration, provenance, and restart

The hypothetical GAD physics model, K ≤ 300 hardware limit, actual orbital capture, two-revolution GAD-off test, and independent verification remained unchanged. Reduced 75%-speed runs varied requested departure excess speed, not hardware Kmax. Each cell flew a fresh original-orbit mission. No saved successful commands or flight states seeded new cells.

Source tree: `controller_source/` within the engineering archive, SHA256 as above. Three executed cells per route can be found under `campaigns/nominal/baseline/` and `campaigns/speed75/`. The baseline planner contains 18 search cells per route, and unexecuted cells stay pending. The 75% first-window profile uses a separate, source-identical plan.

To resume the baseline with the **same executable source tree**, run the scheduler with the original configured cell parameters (40s coarse / 400s portfolio) and the preserved `rc45_plan.json` and completed checkpoints. Interrupted or uncertified cells must restart from the original physical launch state; they cannot be resumed mid-flight. Exporting again with `export_rc45_web.py` re-generates the website status and controls after fresh completions.

## GitHub site artifacts

Website repository: https://github.com/mlowe484/GAD-Mission-Control

- `GAD_RC45_GITHUB_PAGES_READY_2026-10-18.zip`: unzip `rc45/` directory into the GitHub Pages repository. Separate responsive 32-route dashboard, JSON status/coverage manifest, exact-command display payloads for 13 certified routes, prior pilot reference.
- `GAD_RC45_32_ROUTE_REGRESSION_EVIDENCE_2026-10-18.zip`: original physical search cell ledgers, invocation arguments, results, complete exact commands, audit certificates, search logs, physical controller source, export tooling, and website JSON. This evidence contains unresolved attempts as well.
- `route_summary.csv`: 32-row import table for alternate website designs.
- The website state vectors are **numerical reconstructions** from exact recorded controls, not original sampled controller state files nor a replacement for independent replay verification. Full-resolution original controls and signed/source-bound audit metadata remain in evidence.

## Next proposed regression pass

Continue with 75%-speed launch windows 90–180 and beyond on the 19 unresolved routes, and add carefully bounded searches for varied aperture phase, speed fractions, and K fractions. Allocate independent replay audits separately or with controlled concurrency so long physical transits do not lose certificates to unrelated CPU contention. Only mark a route verified once its original-spacecraft finite flight, target orbit, GAD-off stability, independent full-command replay, and source-bound certificate all pass.

No repository commits or GitHub Pages deployment were made in this checkpoint; the packages are ready to place into the existing site.
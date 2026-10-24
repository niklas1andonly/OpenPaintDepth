# How the checker decides

The checker reads paint gauge numbers the way an experienced inspector would, using a few transparent rules.
The rules are **heuristics, not a verdict**. Factory paint varies by plant, colour, year and even between
batches. The code lives in [`src/core/analysis.ts`](../src/core/analysis.ts).

All numbers are total paint film thickness in µm (1 mil = 25.4 µm).

## 1. Baseline: compare the car with itself

For every panel the checker takes the **median** of all spots measured on it. The **baseline** is the median of those
panel values. Medians are used because a single repainted panel barely moves them.

- With 4 or more measured panels, the car's own baseline is used.
- With fewer panels and a reference model selected, the reference model's median is used instead.

## 2. Rules per panel

| Verdict | Rule (m = panel median) | Typical meaning |
|---|---|---|
| 🔴 **Filler** | m ≥ 300 µm | Body filler under the paint |
| 🟠 **Repainted** | m > max(baseline × 1.4, baseline + 60) | Panel refinished |
| 🟠 **Repainted** | m > reference p90 × 1.25 and more than 40 µm above it | Thicker than the same model normally is |
| 🔵 **Thin** | m < baseline × 0.75 and more than 25 µm below it | Heavily polished before, so little clear coat is left |
| 🔵 **Thin** | m < reference p10 × 0.85 (or below 70 µm without a reference) | Thinner than this model normally is |
| 🟡 **Check closer** | m > max(baseline × 1.2, baseline + 30) | Possibly an extra layer or a blend |
| 🟡 **Check closer** | More than 35 µm and 25 % thicker than its left/right partner | One-sided repair |
| 🟡 **Check closer** | Spots on one panel differ by more than 50 µm | Blending or spot repair |
| 🟢 **OK** | none of the above | Consistent with the rest of the car |

A panel shows its most severe verdict. The car's headline shows the most severe verdict of any panel.

## 3. Reference statistics

For every make / model / generation, `scripts/build-db.ts` aggregates the measurements as follows:

1. For each car, take the median of each panel.
2. Drop panels listed in `repaired_panels`, and panels that the repaint or filler rules above would flag against the
   car's own baseline. This keeps unknown-history cars from polluting the reference.
3. For each panel across all cars, compute n, min, p10, median, p90 and max.

Per-panel reference ranges are used once at least 3 cars have that panel. Before that, the whole-car range is used,
and only if the group has at least 3 cars.

Groups that only contain `demo: true` records are labelled *Example data* in the app. Once a group has a single real
record, demo records are ignored for it.

## Known limitations

- Aluminium panels need a gauge with non-ferrous (NFe) mode. Plastic parts usually cannot be measured with
  magnetic or eddy-current gauges.
- Some factory paint is thick or uneven by design, for example around edges and in some colours. That is why
  per-model reference data matters, and why your measurements help.
- Professional repaints can be very close to factory thickness. A gauge cannot prove that a panel is original.

Ideas for better rules are welcome. Please open an issue with real-world examples.

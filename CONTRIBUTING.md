# Contributing to OpenPaintDepth

Thanks for helping! There are three ways to contribute, from easiest to most hands-on.

## 1. Submit a measurement (no coding)

1. Measure a car. See [docs/measuring.md](docs/measuring.md) for how to get good readings.
2. In the [app](https://niklas1andonly.github.io/OpenPaintDepth/), enter your readings under **Check a car**.
3. Open **Add this car to the open database** and fill in make, model and year. Generation, paint type and gauge are optional but useful.
4. Press **Send via GitHub**. A pre-filled issue opens, and you just click *Create*. (No GitHub account yet? It's free: [github.com/signup](https://github.com/signup).)

The intake bot validates the data within a minute. If something is wrong, it comments on the issue. Edit the issue
and it re-checks automatically. If everything is fine, it opens a pull request that a maintainer merges.

**Never include** a VIN, a plate number, an address or photos showing those.

## 2. Add files directly (git)

- One car = one file: `data/measurements/<make-slug>/<model-slug>/<year>-<id>.yaml`
  - `<make-slug>` must exist in [`data/makes.yaml`](data/makes.yaml). Add a missing make in the same PR, keeping the list alphabetical.
  - `<model-slug>` is the model name, lower-cased, with non-alphanumerics turned into `-` (`3 Series` → `3-series`).
  - `<id>` is anything unique, e.g. your initials and a number: `2016-nk01.yaml`.
- The format is defined by [`schema/measurement.schema.json`](schema/measurement.schema.json). All readings are in **µm**.
- Run `npm run validate` before you push. CI runs it too.

### Rules for good data

- `condition: factory` only when you **know** the paint is original (new car, documented history). Otherwise use `unknown`.
- Put panels you know or suspect were refinished in `repaired_panels`. They stay in the file but are left out of the reference.
- Record every spot you measured rather than an average. The tools compute medians.
- Aluminium or plastic panel? Say so in `substrate` (e.g. `substrate: { hood: aluminium }`).
- Synthetic or example data must have `demo: true`. Never present made-up numbers as real.

## 3. Code, translations and ideas

```bash
npm install
npm run dev     # http://localhost:5173
npm test
```

- Shared logic lives in `src/core/`. The checker heuristics are in `src/core/analysis.ts` and documented in
  [docs/methodology.md](docs/methodology.md). Change both together and add a test.
- Keep the app dependency-free at runtime. It should stay fast on a cheap phone in a dark garage.

### Translations

All UI text is in [`web/src/i18n.ts`](web/src/i18n.ts). To add a language, copy the `en` block, translate the
values, add panel names, and register it in `LANGS`. PRs for any language are very welcome.

## For maintainers

- Pull requests opened by the intake bot are created with the default `GITHUB_TOKEN`, so CI does not run on them
  automatically. The data was already validated by the intake workflow, and CI runs again on `main` after merging.
- Merging to `main` rebuilds `db.json` and redeploys the site.

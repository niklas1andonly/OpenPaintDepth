---
name: Submit a measurement
about: Add paint thickness readings of one car (easiest via the web app, which fills this in for you)
title: 'Measurement: <Make> <Model> <Year>'
labels: submission
---

<!-- openpaintdepth:submission -->
<!--
Tip: the web app (Check a car → Add this car to the open database) fills this in for you.
Editing by hand? Fill in the YAML below. All readings are in µm (1 mil = 25.4 µm).
`make` must be a slug from data/makes.yaml. Panels: hood, roof, trunk, fender_fl, fender_fr,
door_fl, door_fr, door_rl, door_rr, quarter_rl, quarter_rr, pillar_l, pillar_r, sill_l, sill_r.
Delete the lines of panels you did not measure (at least 3 are needed).
No VIN, no plate number, no personal data, please.
-->

```yaml
schema: 1
vehicle:
  make: your-make-slug     # e.g. volkswagen
  model: Your Model        # e.g. Golf
  generation: ""           # e.g. Mk7 (optional)
  year: YYYY
condition: unknown   # factory = known original paint, unknown = no known history
readings:  # µm, one entry per measured spot
  hood: []
  roof: []
  trunk: []
  fender_fl: []
  fender_fr: []
  door_fl: []
  door_fr: []
```

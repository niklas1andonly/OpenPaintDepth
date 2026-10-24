# How to measure for OpenPaintDepth

Good data starts with good readings. This takes about 5 minutes per car.

## Before you start

- **Clean and dry** the surface. Dirt and wax add a few µm, and grit damages the probe.
- **Zero or calibrate** the gauge on the supplied plate (Fe and, for aluminium, NFe).
- Measure at **room or outdoor temperature**, not on a panel that is hot from the sun.

## Where to measure

- Measure **flat areas**, at least ~3 cm (1 in) away from edges, creases, badges and stickers.
- Take **3 spots per panel** where you can, for example front, middle and rear of a door.
- Hold the probe **flat and still**. Don't drag it.

| Key | Panel | Key | Panel |
|---|---|---|---|
| `hood` | Hood / bonnet | `roof` | Roof |
| `trunk` | Trunk lid / tailgate | `pillar_l` / `pillar_r` | A-pillars |
| `fender_fl` / `fender_fr` | Front fenders / wings | `sill_l` / `sill_r` | Sills / rocker panels |
| `door_fl` / `door_fr` | Front doors | `door_rl` / `door_rr` | Rear doors |
| `quarter_rl` / `quarter_rr` | Rear quarter panels | | |

`l` / `r` means the car's own left and right, as seen from the driver's seat.

## Units

The database stores **µm**. If your gauge shows **mils**, switch the app to *mil* before entering values. It
converts for you (1 mil = 25.4 µm).

## Is it original?

- `condition: factory`: you **know** it. The car is new, or has a documented accident-free history.
- `condition: unknown`: everything else. That is fine and still very useful. The statistics filter out obvious
  repaints automatically.

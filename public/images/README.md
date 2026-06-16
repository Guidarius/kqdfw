# Images — drop your real photos & logo here

The site is built to look good **before** you have photos (it shows styled
placeholders), and to light up the moment you add real ones. You don't touch any
code except `lib/scene.ts` to point at the files.

## Where things go

| Folder      | What                          | Suggested size / ratio        |
| ----------- | ----------------------------- | ----------------------------- |
| `logo/`     | The KQDFW logo                | transparent PNG or SVG        |
| `hero/`     | One wide banner photo (top)   | landscape, ~1920×1080 (16:9)  |
| `gallery/`  | Community photos (photo wall) | square-ish, ~800×800, JPG/WebP |

## How to use them

1. Copy your image files into the folder above. Example:
   - `public/images/logo/kqdfw.png`
   - `public/images/hero/league-night.jpg`
   - `public/images/gallery/match-1.jpg`, `match-2.jpg`, …

2. Point to them in `lib/scene.ts`:
   - **Hero:** set `hero.image.src` to `"/images/hero/league-night.jpg"`.
   - **Logo:** set `logo.src` to `"/images/logo/kqdfw.png"`.
   - **Gallery:** set each `gallery[].src` (add or remove entries freely —
     the grid adapts to however many you list).

   Paths start at `/images/...` (the `public/` part is implied).

3. Always fill in a short `alt` description for each photo — it's shown if the
   image is missing and helps people using screen readers.

## Tips for good photos

- **Energy over polish.** A slightly blurry shot of a packed, cheering crowd
  beats a perfectly lit empty cabinet.
- **People front and center.** The goal is "this looks like a fun crew" — show faces,
  teams, reactions.
- **Get consent.** Make sure folks are okay being on the public site.
- Compress before uploading (e.g. [squoosh.app](https://squoosh.app)) so pages stay fast.

Leave any `src` as `""` to keep showing the placeholder for that slot.

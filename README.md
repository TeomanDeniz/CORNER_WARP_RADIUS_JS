# corner_warp_radius

<p align="center">
 <a href="https://teomandeniz.github.io/corner_warp_radius/"><img src="https://img.shields.io/badge/Live_Demo-Open-2F5BFF?style=for-the-badge" alt="Live Demo"/></a>
</p>

A tiny WebGL module that rounds the corners of square artwork **without clipping it**.

`border-radius` throws the corners away. This module instead *remaps* the square onto the rounded shape, squeezing the outer pixels inward so a frame, border, or logo hugging the edge survives the rounding instead of being cut off.

```
border-radius (clip)          CORNER_WARP_RADIUS (warp)
┌───────────────┐             ╭───────────────╮
│▓▓           ▓▓│             │▓▓           ▓▓│
│▓             ▓│             │▓             ▓│   the frame bends around
│               │   vs.       │               │   the corner instead of
│▓             ▓│             │▓             ▓│   getting sliced away
│▓▓           ▓▓│             │▓▓           ▓▓│
└───────────────┘             ╰───────────────╯
   corners lost                  corners kept
```

Examples:

<img width="541" height="273" alt="maximum-tension1" src="https://github.com/user-attachments/assets/d975beac-cea7-4dcd-af00-db5396357bcd" />

<img width="803" height="420" alt="maximum-tension" src="https://github.com/user-attachments/assets/d524d8c5-4976-4bb4-8495-ee1496aae3d6" />

---

## How it works

Everything happens in one fragment shader, once per pixel.

For a pixel `p` inside the rounded rectangle, the shader casts a ray from the centre through `p` and asks two questions:

1. **Where does that ray cross the rounded boundary?** (`t_round`) - found with a 22-step binary search against a rounded-box signed-distance function.
2. **Where would it cross the original *square* boundary?** (`t_square`)

The pixel sits at fraction `f = |p| / t_round` of the way out to the rounded edge, so it should sample the source image at fraction `f` of the way to the *square* edge. Along the flat sides the two boundaries coincide, so nothing moves; only the corners get compressed. No pixels are discarded.

A **band profile** decides how much of that compression to apply at each radius, so the middle of the image can stay pixel-perfect while only the outer ring warps:

```
g = pow( clamp((f - inner) / (outer - inner), 0, 1), curve )
scale = mix(1, 1 + (t_square/t_round - 1) * g, strength)
```

- `f < inner` -> `g = 0` -> identity (interior untouched)
- `f > outer` -> `g = 1` -> full warp held flat to the edge (the *plateau*)
- between them -> a ramp shaped by `curve` (`<1` concave, `1` linear, `>1` convex)

The corner shape itself is an **n-norm**: `n = 2` gives circular arcs, `n ≈ 4` an iOS-style squircle, higher `n` a squarer corner. The rounded edge is anti-aliased against the SDF, and output is premultiplied alpha so it composites cleanly over any background.

---

## Files

| File                      | Role                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `corner_warp_radius.js`   | The module. Self-contained warp engine - knows about a canvas, a GL program, a texture. No page/UI knowledge. |
| `script.js`               | Example harness. Reads the sliders, draws the profile graph, wires the buttons - everything UI.               |
| `index.html`, `style.css` | The demo page.                                                                                                |

The module never references anything in the demo, so you can drop `corner_warp_radius.js` into another project and drive it yourself.

---

## Quick start

```html
<canvas id="GL" width="960" height="960"></canvas>
<script src="corner_warp_radius.js"></script>
<script>
	corner_warp_radius.use("GL"); // 1. bind a canvas + build the program

	const	img = new Image();
	img.onload = function ()
	{
		corner_warp_radius.load(img);        // 2. upload the artwork as a texture
		corner_warp_radius.render({          // 3. draw with your parameters
			r:        0.28,   // radius            0 .. ~0.98
			n:        4.0,    // corner shape      2 = round, 4 = squircle
			strength: 1.0,    // warp amount       0 .. 1
			inner:    0.45,   // band inner edge   0 .. 1
			outer:    0.85,   // band outer edge   0 .. 1  (>= INNER)
			curve:    1.0     // ramp shape        <1 concave, 1 linear, >1 convex
		});
	};
	img.src = "cover.jpg";
</script>
```

Re-call `render(...)` any time a parameter changes. `load(...)` again to swap the image (aspect ratio is handled automatically with a cover-fit).

---

## API

### `use(canvasOrId)` -> number

Binds a canvas and builds the GL program. Accepts an element or an id string.

Returns a status code:

| Code | Meaning                      |
| ---- | ---------------------------- |
| `0`  | Success                      |
| `1`  | Element not found            |
| `2`  | WebGL unavailable            |
| `3`  | Could not create the program |
| `4`  | Program failed to link       |

### `load(image)`

Uploads an `HTMLImageElement`, `HTMLCanvasElement`, or `HTMLVideoElement` as the source texture, records its aspect ratio, and stores it as `CURRENT_SOURCE` (used by auto-detection). Does **not** draw - call `render` afterward.

### `render(parameters)`

Draws one frame from an explicit parameter object. Pure: it reads no DOM and has no page side-effects.

| Key        | Range        | Meaning                                                                                 |
| ---------- | ------------ | --------------------------------------------------------------------------------------- |
| `r`        | `0 .. ~0.98` | Corner radius                                                                           |
| `n`        | `2 .. 8`     | Corner shape (n-norm: 2 round, ~4 squircle)                                             |
| `strength` | `0 .. 1`     | Overall warp amount                                                                     |
| `inner`    | `0 .. 1`     | Band inner edge - warp fades in past this                                               |
| `outer`    | `0 .. 1`     | Band outer edge - full warp from here to the boundary (plateau). Keep `outer >= inner`. |
| `curve`    | `~0.25 .. 4` | Ramp shape between the edges                                                            |

> Set `inner == outer` for a clean step at one radius (the shader floors the gap at
> `1e-4`, so it never divides by zero).

### `detect_border_inset(src?)` -> `{w, inner, thin}`

Measures the thickness of a solid frame around the artwork. Defaults to `CURRENT_SOURCE` if no source is passed. It draws the image into a 256x256 buffer (same cover-fit as the shader), then from five points along each edge walks inward from the edge colour until the colour changes. A run counts as a real frame only if it is near-constant **and** ends at a sharp step - this rejects gradients and photos that merely darken toward the edge. The median run across all edges resists a logo crossing one side.

| Field   | Meaning                                                             |
| ------- | ------------------------------------------------------------------- |
| `w`     | Frame thickness as a fraction of the half-size                      |
| `inner` | `1 - w` - the band edge to set so the warp is confined to the frame |
| `thin`  | `true` when no clear frame was found (fall back to a default)       |

Typical use: set both `inner` and `outer` to `inner` for a step that lands exactly on the frame's inner line, hiding the warp seam in an edge that already exists.

### Helpers

- `get(id)` - `document.getElementById` shorthand.
- `uniform(name)` / `shader(type, source)` - internal GL helpers, exposed for extension.

### State (read-only after `use`)

`dom` (canvas), `gl` (context), `program`, `tex` (texture), `aspect`, `current_source`, and the `vs` / `fs` shader sources.

---

## Shader uniforms

Set for you by `render`; listed for anyone editing the shader.

| Uniform                         | Source                                         |
| ------------------------------- | ---------------------------------------------- |
| `U_R`, `U_N`                    | radius, corner shape                           |
| `U_STRENGTH`                    | warp amount                                    |
| `U_INNER`, `U_OUTER`, `U_CURVE` | band profile                                   |
| `U_ASPECT`                      | `aspect`, for cover-fit of non-square images   |
| `U_PIX`                         | `2 / canvas.height`, the edge anti-alias width |
| `U_TEX`                         | the source texture (unit 0)                    |

---

## Notes & gotchas

 - **Draw at >= 2x display size.** Corners compress pixels, so the internal canvas (e.g. `960x960` for a `320px` tile) keeps them crisp.
 - **Premultiplied alpha.** The context is created with `premultipliedAlpha: true` and blends `one, one_minus_src_alpha`. Keep that if you change the blend setup.
 - **Reading pixels needs same-origin images.** `detect_border_inset` calls `getImageData`; a cross-origin image without CORS will taint the canvas and throw. Local files, blob URLs, and canvases are fine.
 - **The warp is corner-concentrated by design.** `scale` is `1.0` along the flat edges and only exceeds it near the corners, which is what keeps a centred grid square. If you ever want uniform inward compression all the way around, that's a different mapping.
 - **Detection tuning.** The main knob is `thresh` (colour-departure sensitivity, `55` on a `0..765` scale) inside `detect_border_inset`: raise it if busy frames read as too thin, lower it if soft frames get missed.

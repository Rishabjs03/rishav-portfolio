# Rishav Agarwal · portfolio

An architect's sketchbook come to life: white paper, graphite pencil, and everything draws itself in as you scroll.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Framer Motion, GSAP + ScrollTrigger, Rough.js and Lenis.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

### Environment

| Variable       | Where       | Why                                                                                                               |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | server only | Optional. Raises the GitHub search rate limit for the Proof of Work section. Never prefix it with `NEXT_PUBLIC_`. |

Put it in `.env.local` for development (git-ignored) and in the Vercel project settings for production.

## Project structure

```
app/
  layout.tsx            fonts, metadata, shared SVG defs, providers, navbar, margin building, cursor
  page.tsx              home: Hero → Featured Projects → Experience → Proof of Work → Skills → Contact
  projects/page.tsx     every project as a drawing sheet
  blog/                 MDX notes (content in data/*.mdx)
  not-found.tsx         "This page was erased"
  globals.css           paper, grid, draw-on keyframes, handwriting, reduced-motion rules
components/
  providers/
    AppProviders.tsx    LazyMotion + MotionConfig, smooth scroll, eraser transitions
    SmoothScroll.tsx    Lenis driven by GSAP's ticker, synced with ScrollTrigger
  sketch/               reusable sketch + motion primitives (see below)
  sections/             page sections: Navbar, Hero, HeroElevation, FeaturedProjects,
                        ProjectSheet, Experience, ProofOfWork, ContributionGraph,
                        PullRequestBoard, Skills, Contact, Footer, SectionHeader
lib/
  design-tokens.ts      colours, stroke widths, Rough.js presets, every motion timing
  sketch.ts             Rough.js + hand-rolled geometry: lines, sketchy rects, hatching,
                        scribble loops, underlines, arrows, spirals (seeded, SSR-safe)
  draw.ts               the draw-on engine (layered GSAP timelines, pencil follower)
  gsap.ts               plugin registration
  hooks.ts              reduced motion, media queries, in-view, element size
  github.ts             server-side PR fetching with caching
  content/              site copy, projects, experience, skills
```

### Sketch components

| Component                 | What it does                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `PencilDefs`              | Shared SVG filters (`#pencil`, `#pencil-grain`, `#pencil-boil-N`) and hatch patterns.                           |
| `SketchBorder`            | Measured box with an overshooting, double-stroked Rough.js border. Redraws with a new seed on hover.            |
| `SketchLine`              | Hand-drawn divider that stretches to its container.                                                             |
| `DrawOnSVG`               | Draws `[data-draw]` strokes layer by layer on load, on view, or scrubbed to scroll.                             |
| `Boil`                    | Line boil: swaps pencil filters at ~8fps while on screen.                                                       |
| `HandwrittenHeading`      | Letter-by-letter handwriting reveal plus a scribbled underline.                                                 |
| `ScribbleButton`          | Buttons/links that get a scribbled loop or underline on hover and focus.                                        |
| `PencilCursor`            | The pencil cursor; loops small targets on hover.                                                                |
| `FocusScribble`           | Keyboard focus ring drawn as a pencil loop.                                                                     |
| `DoodleLayer`             | Lets the pencil draw: drag on empty paper (mouse or stylus) to doodle; Ctrl/⌘+Z undoes, "erase doodles" clears. |
| `BlueprintCard`           | Drawing sheet with crop marks and a title block.                                                                |
| `TapedMedia`, `LazyVideo` | Media taped into the sketchbook; videos load only near the viewport.                                            |
| `TechSticker`             | Hand-lettered tech tags.                                                                                        |
| `Annotation`              | Handwritten margin note with a pencil arrow.                                                                    |
| `ScrollBuilding`          | The building constructed in the margin as you scroll (a ruler + house on small screens).                        |
| `EraserTransition`        | Route transitions: the page is rubbed out, then the new one sketches in. Use `TransitionLink`.                  |
| `SpiralLoader`            | Pure-CSS pencil tracing a spiral (the PR loading state).                                                        |

## How the motion works (and how to tweak it)

All timings live in `lib/design-tokens.ts`.

- **Draw-on.** Every stroke has `pathLength="1"`. With `stroke-dasharray: 1 2` and `stroke-dashoffset: 1.01` it's hidden; tweening the offset to `0` draws it from start to end. The hidden state is set in CSS behind an `.js` class added before first paint, so without JavaScript (or with reduced motion) drawings are simply shown finished.
- **Layers.** `DrawOnSVG` draws `construction → outline → detail → hatch → annotation`. Per-layer duration, stagger, overlap and pencil speed are in `layerTiming`. `motion.timeScale` speeds up everything; `motion.mobileTimeScale` adds a phone speed-up.
- **Pencil follower.** For layers in `pencilLayers`, strokes are drawn one after another and the pencil `<g>` is moved to `getPointAtLength()` of the stroke tip each frame. Duration is `length / speed`, clamped to `[min, max]`.
- **Borders, stickers, annotations, underlines.** Cheaper CSS keyframes (`.draw-path`) started by a `data-play` attribute when the element scrolls into view. Adjust with `motion.borderDraw` / `motion.borderRedraw` or per instance (`drawDelay`, `drawDuration`).
- **Handwriting.** Each letter is revealed by a clip-path wipe, `motion.letterStagger` apart.
- **Line boil.** `Boil` cycles filters that differ only in noise seed, at `motion.boilFps`. Paused off-screen, off on touch devices and with reduced motion.
- **Scroll building.** One GSAP timeline of length 1, scrubbed from page top to bottom. The positions for foundation, scaffolding, floors, roof and flag are listed at the top of `ScrollBuilding.tsx`.
- **Experience floors.** Each floor measures itself, generates its walls and slab, and is drawn with `DrawOnSVG trigger="scrub"` as it rises into view.
- **Eraser transition.** A thick zig-zag stroke painted with the paper pattern sweeps the viewport (`motion.eraseDuration`), the route changes underneath, then the overlay fades (`motion.revealDuration`).
- **Reduced motion.** Honoured everywhere: no draw-on, boil, smooth scroll or custom cursor, just the finished drawings.

## Proof of Work data

`lib/github.ts` queries the GitHub search API for PRs by the site owner (merged, open, closed) on the server. It also fetches the contribution calendar for the sketched heatmap (GraphQL when `GITHUB_TOKEN` is set, otherwise the public github-contributions-api.jogruber.de service). Responses are cached with Next's data cache for an hour (`revalidate: 3600`, tag `github-prs`), so the home page stays static (ISR) and visitors never hit GitHub directly. If GitHub is unreachable, the section shows a friendly note instead of failing.

## Editing content

- Intro lines, links, avatar: `lib/content/site.ts`
- Projects (set `featured: true` to show one on the home page): `lib/content/projects.ts`
- Experience: `lib/content/experience.ts`
- Skills: `lib/content/skills.ts`

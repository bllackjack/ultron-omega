# Demo script (presenter notes)

## The bug, in one sentence

Every gallery image's `onLoad` increments a `loadedCount` state that lives in
`<App>` (it drives the "Loading collection… 37 / 150" bar). Each increment
re-renders the **whole page**. Each re-render of `<CollectionGallery>` reruns an
O(n²) colour-harmony ranking (`rankByCuratorScore`) because it isn't memoised,
and re-renders all 150 `<ArtworkCard>`s. On top of that, every card downloads
the full-size ~700 KB JPEG instead of the thumbnail the API already provides.

| Where | Problem |
| --- | --- |
| `client/src/App.jsx` | `loadedCount` state at the root, bumped once per image |
| `client/src/components/CollectionGallery.jsx` | `rankByCuratorScore(artworks)` and the filter/sort run on every render (no `useMemo`) |
| `client/src/components/ArtworkCard.jsx` | not memoised; `src={artwork.full}`, no `loading="lazy"`, no `width`/`height` |
| `client/src/components/Hero.jsx` | LCP image has no `srcSet`/`sizes` and no `fetchpriority` |
| `client/src/components/Exhibitions.jsx` | below-the-fold cards load full-size images eagerly |

## Before you start

1. `npm install` and `npm run fetch-art` (or `generate-art`) on the demo machine.
2. Use **two Chrome windows**:
   - an **Incognito / Guest window with no extensions** for Lighthouse. React DevTools
     and other extensions skew Lighthouse scores.
   - a normal window with the **React Developer Tools** extension for the Profiler.
3. In React DevTools, open Profiler ⚙ (settings) and tick **"Record why each component
   rendered while profiling"**. Optionally, under Components ⚙, tick **"Highlight updates
   when components render"**. With it on, the whole page flashes over and over while the page loads.

## 1. Measure: Lighthouse "before" report

1. `npm run prod`, then open http://localhost:4000 in the Incognito window.
2. DevTools, then **Lighthouse**: Mode *Navigation*, Device *Mobile*, Category *Performance*, then **Analyze page load**.
3. Things to point out:
   - **Total Blocking Time** is in the seconds, and **Largest Contentful Paint** is far over 2.5 s.
   - Diagnostics: *Reduce JavaScript execution time* / *Minimize main-thread work*,
     *Avoid enormous network payloads* (~100 MB), *Properly size images*,
     *Avoid long main-thread tasks*.
   - Lighthouse says that the main thread is busy, but it can't say which component is responsible.
4. Use ⋮ (top right of the report), then **Save as JSON**, and name it `before.json`.

## 2. Diagnose: React DevTools Profiler

1. Stop `prod`, run `npm run dev`, and open http://localhost:5173 in the normal window.
2. **Turn on network throttling** (Network tab, throttling dropdown, *Add…*, a custom profile of
   about 40 Mbps down and 40 ms latency). On unthrottled localhost, images arrive in bursts and React
   batches them into a handful of commits. On a real connection they arrive one by one.
   Measured on this page: **~9 commits unthrottled vs ~116 commits at 40 Mbps**.
   (Chrome's built-in *Fast 4G* also works, but takes over a minute to load ~100 MB, so stop
   recording after ~10 s.)
3. In DevTools, open **Profiler**, then click **Reload and start profiling** (↻). Wait for the loading bar
   to finish (or ~10 s), then stop.
4. Things to point out:
   - The commit bar (top right) shows **over 100 commits** for a single page load.
   - Click any commit. The **Flamegraph** shows `App`, then `CollectionGallery`, re-rendering, with
     every `ArtworkCard` under it.
   - Select `App`. The "Why did this render?" panel says **a hook changed**. The
     Components tab shows that this hook is the `loadedCount` state, ticking up by one each commit.
   - The **Ranked** view puts `CollectionGallery` at the top, taking far longer than its
     children. Its own render is doing the expensive work: `rankByCuratorScore`.
   - Click an `ArtworkCard`. The "Rendered at" list shows it rendered on almost every commit.
5. Optionally, type in the search box while profiling. Every keystroke also reruns the
   ranking, which shows up as input lag.

## 3. Fix in VS Code

The fix is in `demo/fix.patch`. Either type it live, or apply it with:

```bash
git apply demo/fix.patch
```

What it changes:

1. **Remove the root-level `loadedCount` state** and the global loading bar. Each card
   now owns its own `loaded` state and shows a blurred placeholder (`lqip`) that fades in
   when its image arrives. The page now gets an image loader per card, without re-rendering the whole app.
2. **`useMemo`** the curator ranking (keyed on `artworks`) and the filtered/sorted list
   (keyed on query, period and sort).
3. **`React.memo(ArtworkCard)`**, passing the stable `onSelect` instead of an inline arrow.
4. **Images**: cards use the 480px WebP `thumb` with `loading="lazy"`,
   `decoding="async"` and explicit `width`/`height`. The hero gets `srcSet`/`sizes`
   (480/960/full) and `fetchpriority="high"`. The exhibition cards lazy-load thumbnails.

## 4. Verify

1. Profiler again, with the same throttling: **~4 commits** on load (116 before),
   `CollectionGallery`'s expensive render happens once. As you scroll you'll see more small
   commits. Each one is a single `ArtworkCard` setting its own `loaded` state, which is well under 1 ms.
2. `npm run prod` and Lighthouse in Incognito again. Save as `after.json`.
3. Compare the two reports, side by side in the
   [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/) (drag the JSON in).

## Reference results

`demo/reports/before.report.json` and `after.report.json` (plus `.html`) were produced
with Lighthouse 12 (headless Chromium, mobile, simulated throttling) against the
**generated placeholder art**. Your numbers on real art and your own hardware will differ,
but the before/after gap should look the same.

| Metric | Before | After |
| --- | --- | --- |
| Performance score | 49 | 91 |
| Largest Contentful Paint | 15.9 s | 3.3 s |
| Total Blocking Time | 1,550 ms | 120 ms |
| Time to Interactive | 17.0 s | 3.4 s |
| Total page weight | 105,142 KiB | 484 KiB |
| Main-thread work | 5.0 s | 1.3 s |
| React commits on load (40 Mbps) | 116 | 4 |

Lighthouse scores vary by a few points from run to run. TBT especially depends on how
many image loads React batches together, so run it twice if a number looks off.

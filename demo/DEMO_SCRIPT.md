# Demo script (presenter notes)

## The bug

The collection gallery is slow for two reasons. Each is fixed with **one line**.

| File | Slow line | Problem |
| --- | --- | --- |
| `client/src/components/CollectionGallery.jsx` (line 26) | `const ranked = rankByCuratorScore(artworks);` | An expensive "Curator's picks" calculation (~300+ ms) re-runs on **every** render. The gallery re-renders each time an image loads (to update the loading bar), so it runs 100+ times. |
| `client/src/components/ArtworkCard.jsx` (line 6) | `<img src={artwork.full} … />` | All 150 cards download the full-size (1686px) image from the museum's server right away, instead of the 400px thumbnail. |

## The fix (2 lines, also in `demo/fix.patch`)

```diff
- const ranked = rankByCuratorScore(artworks);
+ const ranked = useMemo(() => rankByCuratorScore(artworks), [artworks]);
```

```diff
- <img src={artwork.full} alt={artwork.title} onLoad={onLoad} />
+ <img src={artwork.thumb} loading="lazy" alt={artwork.title} onLoad={onLoad} />
```

`useMemo` is already imported in that file. It's used one line above for the
cheap period counts, which makes a good talking point: "we memoised the cheap
thing and forgot the expensive one."

## Steps

### 1. Lighthouse: before
1. `npm run prod`, then open http://localhost:4000 in an **Incognito** window (extensions skew scores).
2. DevTools, then **Lighthouse**, tick *Performance*, *Mobile*, then **Analyze page load**.
3. Point out **Total Blocking Time**, **Total byte weight**, *Reduce JavaScript execution time*,
   and *Properly size images*.
4. ⋮, then **Save as JSON**, and name it `before.json`.

### 2. React DevTools Profiler: find the cause
1. Stop the server, run `npm run dev`, and open http://localhost:5173 in a normal window with React DevTools.
2. Optional: on a very fast connection, set Network throttling to a slower profile (e.g. 40 Mbps)
   so images arrive one by one and the re-renders are easier to see.
3. In the **Profiler** tab, click **Reload and start profiling**. Stop after the loading bar finishes (or ~10 s).
4. Point out:
   - **100+ commits** in the commit bar for a single page load.
   - Click a commit, then the **Ranked** view. `CollectionGallery` is at the top, ~60 ms+ each time.
   - "Why did this render?": its props changed (`loadedCount`), because an image loaded.
   - Open `CollectionGallery.jsx`, and line 26 is the expensive call with no `useMemo`.

### 3. Fix in VS Code
Make the two edits above, or run `git apply demo/fix.patch`.

### 4. Re-test
1. Profiler again: far fewer commits, and each one is cheap.
2. `npm run prod`, Lighthouse in Incognito again, then **Save as JSON** as `after.json`.

## What you should feel (before the fix)

- While the paintings load, the page freezes over and over: scrolling stutters and clicks are delayed.
- After loading, typing in the search box lags noticeably on every key.
- After the fix, both are smooth.

## Notes

- Images come from the Art Institute of Chicago's servers, so the demo needs a
  working internet connection. Test on the venue's network beforehand.
- Lighthouse scores move a few points between runs, so run it twice if a number looks odd.

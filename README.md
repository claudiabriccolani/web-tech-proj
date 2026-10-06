# LMML – Live Museum of Movie Locations

Companion web app for a one-day visit to filming locations in London.
End-of-course project for *Information Modeling and Web Technologies*
(Master's Degree in Digital Humanities and Digital Knowledge, University of Bologna).

Plain HTML + CSS + vanilla JavaScript (ES modules). No framework, no build
step, no npm dependencies. Libraries from CDN: [Leaflet](https://leafletjs.com/)
(map, OpenStreetMap tiles) and [qrcodejs](https://github.com/davidshimjs/qrcodejs).

## Run it

ES modules and `fetch()` don't work from `file://`, so the folder must be
served by a local web server. Python's built-in one needs nothing installed.
From the project folder:

```sh
python -m http.server 8000
```

Then open http://localhost:8000 and stop the server with Ctrl+C.

Open the browser console (F12): at startup the app checks the data and lists
any problems ("LMML data check").

## File structure

```
index.html                 app shell: header, <main>, footer; loads CSS, CDN libraries, js/app.js
css/base.css               structure and layout only (grid areas, scroll containers), neutral tokens
css/themes/victorian.css   placeholder theme
css/themes/sixties.css     placeholder theme (also moves blocks around, to prove layout switching)
data/site.json             title, intro, about, disclaimer template, docs sections, list of themes
data/locations.json        the locations (schema.org + lmml:)
data/narratives.json       the narratives (chapters → steps)
img/                       images (placeholders for now)
js/app.js                  bootstrap: load data → validate → state → theme → chrome → router
js/router.js               hash routing (#/location/:id …)
js/state.js                user choices, saved in localStorage
js/data.js                 loads the JSON files; accessor helpers for lmml: properties
js/validate.js             data checks, reported in the console
js/narrative.js            narrative → flat sequence of screens (chapter intros + locations)
js/navigation.js           where prev / next / "Return to the narrative" point
js/textSelector.js         chooses the text to show (pure functions)
js/theme.js                applies a theme (data-theme + stylesheet swap)
js/qr.js                   draws a QR code
js/dom.js                  el() helper to build DOM nodes
js/render/chrome.js        header and footer (switchers, menu, prev/next)
js/render/page.js          common skeleton of text pages
js/render/cover.js         #/
js/render/map.js           #/map, #/map/:id
js/render/location.js      #/location/:id
js/render/metadataTable.js metadata table generated from the location object
js/render/chapter.js       #/chapter/:narrativeId/:n
js/render/about.js         #/about
js/render/docs.js          #/docs, #/docs/:section
js/render/disclaimer.js    #/disclaimer
js/render/qr.js            #/qr (printable QR sheet)
js/render/notFound.js      unknown routes
```

## How it works

1. `app.js` loads the three JSON files, validates them, restores the state from
   `localStorage` and applies the theme.
2. The router listens to `hashchange`. For each hash it finds the route in the
   table in `app.js`, empties `<main>` and calls the view's `render` function.
3. After rendering, `navigation.js` computes prev/next and `chrome.js` updates
   the header and footer.
4. Changing theme or narrative saves the state and re-renders the current route.

### Routes

| Hash | View |
|---|---|
| `#/` | cover |
| `#/map`, `#/map/:id` | map (optionally centred on a location) |
| `#/location/:id` | location page |
| `#/chapter/:narrativeId/:n` | chapter intro (n starts at 1) |
| `#/about` | about the author |
| `#/docs`, `#/docs/3.2` | documentation (optionally scrolled to a section) |
| `#/disclaimer` | disclaimer |
| `#/qr` | printable QR sheet |

### Prev / next

- **In a narrative:** the chapters are flattened into a sequence:
  `[chapter 1] [loc A] [loc B] [chapter 2] [loc C]`. Prev/next move along it,
  and the first screen's "Previous" goes back to the cover.
- **A location or chapter not in the current narrative** (for example, opened
  from the map) shows no prev/next, only "Return to the narrative". A location
  page also says which narratives it does belong to. (York Rise is in
  "Recreate the shot" only.) That link
  goes to the last screen visited in the narrative.
- **Cover:** "Next" starts the current narrative.
- **Map → About → Docs → Disclaimer → QR:** these pages form their own chain.
  They also show "Return to the narrative" once a visit has begun.
- **Keyboard:** the ← and → keys follow prev/next.

### Text selection

- Each text sits in a cell of a 3 × 3 × 3 grid. Each axis is an ordered scale:
  - length: short < medium < long
  - level: intro < average < advanced
  - tone: young < adult < scholar
- Each of the six buttons moves one step along one axis (the language buttons, when present, choose which language the six buttons work on):

| Button | Axis | Direction |
|---|---|---|
| Tell me more / Tell me less | length | +1 / −1 |
| Too simple / Too difficult | level | +1 / −1 |
| Additional details and references / Do you want to play? | tone | +1 (→ scholar) / −1 (→ young) |

- Only some cells exist, so a button chooses in this order of priority:
  1. Only texts strictly beyond the current one in that direction are candidates.
  2. Among them, take the smallest step on that axis.
  3. Then the text closest to the user's preference on the other two axes.
  4. Then the most "central" text (medium / average / adult).
- A button with no candidate is disabled.
- The preference (`state.textPref`) is updated only on the axis that was
  moved. It carries over to the next location, where the text closest to the
  preference is shown first.

## Data model

The JSON files are plain JSON shaped like JSON-LD:

- Property names come from [schema.org](https://schema.org) (`Place`,
  `GeoCoordinates`, `PostalAddress`, `Movie`, `TVEpisode`, `TVSeries`,
  `ImageObject`, `CreativeWork`, `Person`).
- Terms schema.org doesn't cover use the `lmml:` prefix. The `@context` at
  the top of `locations.json` declares both vocabularies.
- In JavaScript, prefixed names need brackets: `loc['lmml:cameraBearing']`.
  These accesses are collected in `js/data.js`.

### lmml: terms

| Term | On | Meaning |
|---|---|---|
| `lmml:cameraPosition` | Place | GeoCoordinates where the camera stood |
| `lmml:cameraBearing` | Place | camera direction, degrees clockwise from north |
| `lmml:cameraConfidence` | Place | `"estimated"` until the camera position and bearing have been checked on site |
| `lmml:shotDescription` | Place | how to find the exact angle |
| `lmml:appearsIn` | Place | the main Movie / TVEpisode / TVSeries filmed here (schema.org has no "filmed at" property on Place); its `datePublished` orders the timeline |
| `lmml:alsoAppearsIn` | Place | list of other works filmed at the same place |
| `lmml:facts` | Place | short atomic facts, each `{text, url}` with the source it comes from; the texts are written only from these |
| `lmml:openQuestions` | Place | points on which sources disagree or that could not be confirmed |
| `lmml:imageTodo` | Place | note about a missing image |
| `lmml:visitorAccess` | Place | for interior scenes: `{dateChecked, statements: [{text, url}]}` with opening hours, booking and photography rules from the venue's own site; shown in the metadata table as "Visiting and photography" |
| `lmml:estimatedMinutes` | narrative | `{travel, visits, visitMinutesPerStop, total}`; `total` is shown on the cover |
| `lmml:sceneDescription` | Place | description of the scene |
| `lmml:representsPlace` | Place | the Place it plays in the fiction, or `null` |
| `lmml:verified` | Place | `true` once the data has been checked |
| `lmml:texts` | Place, narrative step | the texts (see below) |
| `lmml:length` / `lmml:level` / `lmml:tone` | text | the text's cell in the grid |
| `lmml:transition` | narrative step | `{mode, minutes, text}`: how to get here from the previous step |
| `lmml:orderedBy` | narrative | e.g. `"datePublished"`: the validator checks the order |

Some schema.org properties are used in a specific sense:

- `ImageObject.contentUrl` is the image file.
- `ImageObject["lmml:alt"]` is the `alt` text: what is visible in the picture, in
  about 125 characters. The `caption` says what the picture is of.
- `ImageObject.url` is its source page.
- `citation` lists the sources that feed the disclaimer. Every `url` used in
  `lmml:facts` must also be in `citation` (the validator checks it).
- `ImageObject.creditText` is "author, licence, via Wikimedia Commons" and
  `ImageObject.license` is the licence URL.

`lmml:facts`, `lmml:openQuestions` and `lmml:imageTodo` are working data: the
metadata table does not show them. `VERIFY.md` lists them location by location.

## How to…

### Add a location

1. Copy an object in `data/locations.json` → `locations` and give it a new,
   unique `identifier`. This becomes the URL: `#/location/<identifier>`.
2. Fill in `name`, `address` and `geo`, the camera fields, `lmml:appearsIn`
   and the scene fields.
3. Add the `image` entries (put the files in `img/`).
4. Add the `citation` entries. Every `http(s)` URL in `citation` and
   `image[].url` is listed on the disclaimer page automatically.
5. Set `lmml:verified` to `true` once everything has been checked.
6. Add the location to one or more narratives (see below).
7. Reload and check the console for data problems.

For a TV episode, use `"@type": "TVEpisode"` with `episodeNumber`,
`partOfSeason` and `partOfSeries`.

New properties you add appear in the metadata table automatically. To give
one a nicer label, add it to `LABELS` in `js/render/metadataTable.js`.

### Add a text

Add an object to the location's `lmml:texts`:

```json
{ "lmml:length": "medium", "lmml:level": "advanced", "lmml:tone": "scholar",
  "inLanguage": "en", "text": "<p>…</p>" }
```

- Only one text per cell (the validator warns about duplicates).
- `text` is HTML and is inserted as-is, so only put trusted content there.
- Write texts only from the location's `lmml:facts`. To say something new,
  add the fact (with its source) first.
- To give a location a different text **inside one narrative**, add
  `lmml:texts` to that narrative step. Each of those texts replaces the
  location's default text of the same cell and language; the other default
  texts stay available.
- `inLanguage` sets the language (`en` if missing). When a location has texts
  in more than one language, language buttons appear next to the six switches.
  The switches only move among the texts of the current language, so a
  language with a single text has all six disabled.

### Add a narrative

Add an object to `data/narratives.json` → `narratives`:

```json
{
  "identifier": "my-narrative",
  "name": "My narrative",
  "description": "<p>Shown on the cover.</p>",
  "chapters": [
    { "name": "Chapter title", "text": "<p>Chapter intro screen.</p>",
      "steps": [
        { "locationId": "st-lukes-mews", "lmml:transition": null },
        { "locationId": "marylebone-station",
          "lmml:transition": { "mode": "walk", "minutes": 15, "text": "<p>Directions…</p>" } }
      ] }
  ]
}
```

- The new narrative appears in the switcher and on the cover automatically.
- A location can appear only once per narrative.
- `lmml:transition` always describes the way from the previous step, even
  across chapters. Use `null` for the very first step.

### Add a theme

1. Create `css/themes/<id>.css`. Scope every rule with
   `:root[data-theme="<id>"]`.
2. Register it in `data/site.json` → `themes`:
   `{ "id": "<id>", "label": "…", "href": "css/themes/<id>.css" }`.
3. Override the custom properties from section 1 of `css/base.css`:
   - **Typography:** `--font-body`, `--font-heading`, `--font-ui`, `--line-height`
   - **Colours:** `--color-*`, `--map-*`
   - **Layout of the whole page:** `--app-areas`, `--app-rows`
   - **Layout of location pages:** `--loc-landscape-areas | -columns | -rows`
     and `--loc-portrait-areas | -columns | -rows`
4. The location page has these areas: `header`, `media`, `text`, `meta`,
   `qr` and, in portrait only, `tabs` and `panel`. Rows and columns must
   match the areas template.
5. For anything else, add rules that target the `data-role` hooks below.

## Style hooks

**Elements.** The HTML uses a restricted vocabulary: `header nav main footer
article section figure figcaption img h1 h2 h3 p a button label select table
caption tbody tr th td ul ol li div span`.

**`data-role` attributes.** Everything is targeted through `data-role`:

- **Shell:** `site-header`, `site-title`, `menu-toggle`, `site-menu`,
  `switchers`, `theme-switch`, `narrative-switch`, `view`, `site-footer`,
  `step-nav`, `nav-prev`, `nav-next`, `nav-return`, `nav-position`
- **Text pages:** `page`, `page-header`, `page-kicker`, `page-title`,
  `page-body`, `cover-intro`, `narrative-list`, `narrative-card`,
  `chapter-intro`, `chapter-steps`, `docs-toc`, `docs-section`,
  `section-number`, `disclaimer-text`, `source-list`, `qr-grid`, `qr-card`
- **Location:** `location`, `location-header`, `transition`,
  `location-kicker`, `outside-note`, `location-title`, `location-work`, `verified-flag`,
  `location-media`, `location-figure`, `figure-caption`, `caption-credit`,
  `panel-tabs`, `location-text`, `text-controls`, `text-switch`,
  `lang-switch`, `text-cell`, `text-body`, `location-meta`,
  `metadata-table`,
  `location-qr`, `qr-code`, `qr-url`, `map-link`
- **Map:** `map`, `map-legend`, `map-canvas`. Leaflet shapes use the classes
  `lmml-marker`, `lmml-marker--in-route`, `lmml-route`, `lmml-camera-cone`,
  `lmml-camera-arrow` and `lmml-camera`.

**Other `data-*` attributes.** These describe the current state, so themes
can style by content:

- **Page:** `main[data-view]`, `[data-page]`
- **Location:** `[data-location]`, `[data-verified]`, `[data-in-narrative]`,
  `[data-active-panel]`, `[data-panel]`
- **Narratives and chapters:** `[data-narrative]`, `[data-current]`,
  `[data-chapter]`
- **Current text:** `[data-text-length]`, `[data-text-level]`,
  `[data-text-tone]`, `[data-text-source="location|narrative"]`
- **Other:** `[data-work-type]`, `[data-transition-mode]`, `[data-switch]`,
  `[data-axis]`, `[data-depth]`

## Open TODOs

- All 15 locations have `lmml:verified: false` and
  `lmml:cameraConfidence: "estimated"`. `VERIFY.md` lists what to check by
  hand for each one (camera, open questions, missing images).
- `baseUrl` in `data/site.json` is set to the GitHub Pages address, so QR
  codes always encode the public site, even when printed from `localhost`.
  Change it if the site moves.
- The about text and most documentation sections in `data/site.json` are
  still TODO.

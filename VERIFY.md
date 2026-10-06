# VERIFY – what to check by hand

Nothing in `data/locations.json` is marked as verified yet: every location has `lmml:verified: false` and `lmml:cameraConfidence: "estimated"`. This file lists, location by location, what needs a human check. When a location is done, set `lmml:verified` to `true` and `lmml:cameraConfidence` to `"verified"` in the data.

## Before the locations: things that apply to everything

- **Camera positions and bearings are estimates.** They were worked out from descriptions of the shots, from the coordinates and captions of Wikimedia Commons photos and from the street geometry on OpenStreetMap. No film still was consulted. The Street View links below open at the estimated position, looking along the estimated bearing.
- **Interior scenes.** Selfridges, Smith & Wollensky, Grosvenor Chapel and the Tate Modern scene of Fleabag were filmed indoors. The camera position given is the outside of the building. Each has an `lmml:visitorAccess` field with opening hours, booking and photography rules taken from the venue's own site on 2026-10-06: opening hours change, so re-check them before the visit.
- **Light and time-of-day advice** in the *Recreate the shot* texts is derived from the estimated bearing (which way the façade faces), not from a source. If a bearing changes, re-read that step's text.
- **Directions and minutes** in the transitions come from the TfL journey planner (queried for a Tuesday at 11:00). Street-by-street wording is mine: walk the trickier legs on Street View, especially Charlotte Mews → Great Portland Street, Bank → Leadenhall Market and the walk into St Luke's Mews.
- **Scholar texts** contain, besides the facts, one or two sentences of interpretation each (for example on what the cue cards change in the Love Actually scene). They add no factual claims, but they are my reading, not a source's: keep, rewrite or cut.
- **French short texts** use the usual French names *Chaudron Baveur* and *Mangemorts* for the Leaky Cauldron and the Death Eaters; film titles are left in English.
- **Not checked in a real browser by hand.** Pages were rendered in headless Chrome at 1280×800 (data check OK, no console errors). The portrait layout could not be tested reliably in headless mode: check it on a phone.
- **Image height on location pages.** With a long transition text the header takes a lot of room and the image row becomes short at 1280×800. This is a layout matter, so it was left for you.
- **Photo captions.** All 26 photos have now been opened and each has its own `lmml:alt` text. Eleven captions say something the picture does not show or cannot confirm: they are listed in `CAPTIONS.md` with a suggested replacement, waiting for your approval. No caption was changed.
- **Inline markup in texts.** The texts use `em` (titles) and `strong`, which are not in the restricted element list in the README: if the course requires that list strictly, replace them with `span`.
- **Sunset times at York Rise** come from the US Naval Observatory for 2026, in UTC; I converted the June and September values to British Summer Time by adding one hour. Timeanddate refused automated access and the HM Nautical Almanac Office site was unavailable, so neither was used.
- **Before printing QR codes** set `baseUrl` in `data/site.json`; they currently encode `localhost`.
- `author` in `data/site.json` was set to "Claudia Briccolani" (from the git user name): correct it if needed. The about text is still TODO.

## Day plan

- **Historical timeline** (14 locations, York Rise excluded, same-year stops ordered by distance): 380 min of travel (6 h 20) + 140 min at the stops (10 min each) = about 8 h 40 min, without a lunch break.
- **Recreate the shot** (15 locations, Notting Hill first so that the Grosvenor Chapel is reached around midday): 263 min of travel (4 h 23) + 300 min at the stops (20 min each, deliberately longer) = about 9 h 23 min, without a lunch break.

See the final report for how feasible each one is.

## Locations

### 1. Marylebone Station — A Hard Day's Night (1964)

`marylebone-station` · Melcombe Place, NW1 6JJ · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5226092,-0.1631475)

**Camera (estimated)**

- [ ] Position 51.52262, -0.16225, bearing 345° (N) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.52262,-0.16225&heading=345&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. The Beatles Bible says a scene was filmed in Boston Place, the street along the east side of the station, with the group running towards the camera chased by fans. Stand at the south end of Boston Place (corner of Melcombe Place) and look north up the street. The direction of the run is not stated in the sources: check it against the film.

**Open questions**

- [ ] Dates: Wikipedia says filming began at Marylebone on 2 March 1964, while The Beatles Bible dates the opening chase to 5 and 12 April 1964. These may be two different shoots (the train departure in March, the chase in April) but no source read says so explicitly.
- [ ] The sources do not say which way the Beatles run along Boston Place, nor which platform was used: the camera position and bearing are a guess to be checked against the film.

**Images**

- [ ] `img/marylebone-station-1.jpg` — "The concourse of Marylebone station in 2011." (Ben Brooksbank, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Marylebone_station,_concourse_2011_-_geograph.org.uk_-_5363518.jpg). Check that the caption matches what the photo shows.
- [ ] `img/marylebone-station-2.jpg` — "Boston Place, the street along the east side of Marylebone station, where the Beatles were filmed running from their fans." (Christopher Hilton, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Boston_Place,_up_the_east_side_of_Marylebone_station_-_geograph.org.uk_-_2413994.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: A Hard Day's Night film locations](https://www.movie-locations.com/movies/h/Hard-Days-Night.php)
- [Wikipedia: A Hard Day's Night (film) (credits, shooting schedule, premiere)](https://en.wikipedia.org/wiki/A_Hard_Day%27s_Night_(film))
- [The Beatles Bible: filming A Hard Day's Night, 5 April 1964 (Marylebone Station, Boston Place)](https://www.beatlesbible.com/1964/04/05/filming-a-hard-days-night-24/)
- [The Beatles Bible: filming A Hard Day's Night, 12 April 1964 (return to Marylebone Station)](https://www.beatlesbible.com/1964/04/12/filming-a-hard-days-night-29/)
- [Tokyo Fox: London filming locations of A Hard Day's Night](https://tokyofox.net/2016/02/27/london-filming-locations-a-hard-days-night-1964/)
- [Wikipedia: Marylebone station (history, use as a filming location)](https://en.wikipedia.org/wiki/Marylebone_station)
- [OpenStreetMap: coordinates of Marylebone station building](https://www.openstreetmap.org/?mlat=51.5226092&mlon=-0.1631475#map=19/51.5226092/-0.1631475)

### 2. Charlotte Mews — A Hard Day's Night (1964)

`charlotte-mews` · Charlotte Mews (entrance from Tottenham Street), W1T 4RG · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5203463,-0.1358992)

**Camera (estimated)**

- [ ] Position 51.52027, -0.13582, bearing 327° (NW) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.52027,-0.13582&heading=327&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand on the south pavement of Tottenham Street, where the Scala Theatre used to be, and look north-west into the archway marked 'Charlotte Mews W1': the four run out of it towards you.

**Open questions**

- [ ] Demolition date of the Scala: Movie-Locations and Tokyo Fox say it was demolished in 1969; Wikipedia says it closed in 1969 and that planning permission for demolition was granted in 1972.
- [ ] Address of the Scala: Movie-Locations gives 21 Tottenham Street; Wikipedia says the main entrance was in Charlotte Street, with the old Tottenham Street portico as the stage door, and gives Scala House as 25 Tottenham Street. Which door the Beatles run into should be checked against the film.
- [ ] Charlotte Mews has more than one opening; the photo and the camera estimate use the archway on Tottenham Street. Confirm it is the one in the film.

**Images**

- [ ] `img/charlotte-mews-1.jpg` — "The entrance to Charlotte Mews seen from Tottenham Street, the side where the Scala Theatre stood." (Philafrenzy, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Charlotte_Mews_from_Tottenham_Street.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: A Hard Day's Night film locations](https://www.movie-locations.com/movies/h/Hard-Days-Night.php)
- [Wikipedia: A Hard Day's Night (film) (credits, shooting schedule, premiere)](https://en.wikipedia.org/wiki/A_Hard_Day%27s_Night_(film))
- [Shady Old Lady's Guide to London: The Beatles and Charlotte Mews](https://www.shadyoldlady.com/location/2788)
- [Tokyo Fox: London filming locations of A Hard Day's Night](https://tokyofox.net/2016/02/27/london-filming-locations-a-hard-days-night-1964/)
- [Wikipedia: Scala Theatre (history of the theatre opposite Charlotte Mews)](https://en.wikipedia.org/wiki/Scala_Theatre)
- [OpenStreetMap: coordinates of southern end of Charlotte Mews](https://www.openstreetmap.org/?mlat=51.5203463&mlon=-0.1358992#map=19/51.5203463/-0.1358992)

### 3. The Travel Book Co. (142 Portobello Road) — Notting Hill (1999)

`notting-hill-bookshop` · 142 Portobello Road, W11 2DY · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5146653,-0.2041788)

**Camera (estimated)**

- [ ] Position 51.51467, -0.20404, bearing 255° (W) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.51467,-0.20404&heading=255&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand on the pavement opposite no. 142 and face the shop front square on (roughly west-south-west). Which side of the road no. 142 is on was not confirmed by a source: check on Street View.

**Open questions**

- [ ] Wikipedia says 'The Travel Book Store is located at 142 Portobello Road' without distinguishing the film location from the real Travel Bookshop in Blenheim Crescent; Movie-Locations is explicit that there never was a travel bookshop at no. 142.
- [ ] No source read says whether the bookshop interior was shot at no. 142 or on a set (Wikipedia only says interior scenes were filmed at Shepperton Studios).
- [ ] The shop at no. 142 has changed hands several times: check what is there now.
- [ ] Postcode: OpenStreetMap gives W11 2DY for no. 142; the caption of the Commons photo gives W11 2DZ.

**Images**

- [ ] `img/notting-hill-bookshop-1.jpg` — "The gift shop at 142 Portobello Road, the front used for William Thacker's bookshop, in 2018." (Enrico Cabianca, CC0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:NH_Enrico.jpg). Check that the caption matches what the photo shows.
- [ ] `img/notting-hill-bookshop-2.jpg` — "The real Travel Bookshop at 13 Blenheim Crescent in February 2011, the year it closed." (Ewan-M, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Travel_Bookshop,_Notting_Hill,_W11.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: Notting Hill film locations (bookshop, blue door)](https://www.movie-locations.com/movies/n/Notting-Hill.php)
- [Wikipedia: Notting Hill (film) (credits, production, release)](https://en.wikipedia.org/wiki/Notting_Hill_(film))
- [OpenStreetMap: coordinates of 142 Portobello Road](https://www.openstreetmap.org/?mlat=51.5146653&mlon=-0.2041788#map=19/51.5146653/-0.2041788)

### 4. The blue door (280 Westbourne Park Road) — Notting Hill (1999)

`notting-hill-blue-door` · 280 Westbourne Park Road, W11 1EH · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5169054,-0.2063157)

**Camera (estimated)**

- [ ] Position 51.51679, -0.20626, bearing 345° (N) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.51679,-0.20626&heading=345&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand on the pavement on the other side of Westbourne Park Road, a few yards west of the Portobello Road junction, and face the door (roughly north). This is a private home: photograph from the public pavement only.

**Open questions**

- [ ] Postcode: OpenStreetMap gives W11 1EH for no. 280; the caption of the Commons photo gives W11 1EF.
- [ ] Sources read do not say when the door was auctioned, nor what colour it was in between ('blue again').

**Images**

- [ ] `img/notting-hill-blue-door-1.jpg` — "The blue door at 280 Westbourne Park Road in May 2023." (Matt Brown, CC BY 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:The_famous_blue_door_of_Notting_Hill.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: Notting Hill film locations (bookshop, blue door)](https://www.movie-locations.com/movies/n/Notting-Hill.php)
- [Wikipedia: Notting Hill (film) (credits, production, release)](https://en.wikipedia.org/wiki/Notting_Hill_(film))
- [OpenStreetMap: coordinates of 280 Westbourne Park Road](https://www.openstreetmap.org/?mlat=51.5169054&mlon=-0.2063157#map=19/51.5169054/-0.2063157)

### 5. Leadenhall Market (Bull's Head Passage) — Harry Potter and the Philosopher's Stone (2001)

`leadenhall-market` · Bull's Head Passage, Leadenhall Market, EC3V 1LU · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5125556,-0.0840255)

**Camera (estimated)**

- [ ] Position 51.5125, -0.0839, bearing 300° (NW) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.5125,-0.0839&heading=300&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. In Bull's Head Passage, on the edge of the market, find the optician with the rounded doorway. Stand a few metres back in the passage so that the door fills the frame. The passage is narrow and may not be covered by Street View: check on site.

**Open questions**

- [ ] Address of the door: Time Out gives The Glass House, 2-3 Bull's Head Passage; Free Tours by Foot gives 42 Bull's Head Passage.
- [ ] State of the shop in 2000: The Magician says it was an empty shop that the filmmakers painted black; Time Out quotes the owner as if the optician was already there with an unrenovated door.
- [ ] Colour of the door: Free Tours by Foot calls it 'a blue door'; The Magician says the exterior was painted black for the film. Check the present colour on site.

**Images**

- [ ] `img/leadenhall-market-1.jpg` — "The shop in Bull's Head Passage used as the entrance to the Leaky Cauldron, photographed in 2007." (Dtobias, CC BY-SA 3.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:London-building-leaky-cauldron-2007-07-16.jpg). Check that the caption matches what the photo shows.
- [ ] `img/leadenhall-market-2.jpg` — "The west alley of Leadenhall Market, under the roof designed by Sir Horace Jones in 1881." (Doyle of London, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Leadenhall_Market,_City_of_London_(Interior_-_01).jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Wikipedia: Leadenhall Market (history, film appearances)](https://en.wikipedia.org/wiki/Leadenhall_Market)
- [Time Out London: London on screen – the Leaky Cauldron from Harry Potter and the Philosopher's Stone](https://www.timeout.com/london/news/london-on-screen-the-leaky-cauldron-from-harry-potter-and-the-philosophers-stone-070318)
- [Free Tours by Foot: Harry Potter in Leadenhall Market](https://freetoursbyfoot.com/harry-potter-in-leadenhall-market/)
- [The Magician: film-by-film round-up of Harry Potter locations](https://www.the-magician.co.uk/harry-potter-film-locations.htm)
- [Wikipedia: Harry Potter and the Philosopher's Stone (film) (credits, release)](https://en.wikipedia.org/wiki/Harry_Potter_and_the_Philosopher%27s_Stone_(film))
- [OpenStreetMap: coordinates of The Glass House optician, Bull's Head Passage](https://www.openstreetmap.org/?mlat=51.5125556&mlon=-0.0840255#map=19/51.5125556/-0.0840255)

### 6. Somerset House — Love Actually (2003)

`somerset-house` · Strand, WC2R 1LA · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5111,-0.1178)

**Camera (estimated)**

- [ ] Position 51.51085, -0.11745, bearing 0° (N) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.51085,-0.11745&heading=0&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate, low confidence. The film shows the courtyard as an ice rink; the sources do not describe the angle. The estimate is from the south side of the courtyard looking north towards the Strand block. The rink is seasonal: outside winter you will see the fountains.

**Open questions**

- [ ] No source read describes the camera angle of the skating shot: bearing and position are a guess.
- [ ] The ice rink is seasonal; check the current dates before sending visitors to 'recreate the shot'.

**Images**

- [ ] `img/somerset-house-1.jpg` — "The winter ice rink in the courtyard of Somerset House, December 2025." (Matt Brown, CC BY 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Somerset_House_ice_rink_2025-12-09.jpg). Check that the caption matches what the photo shows.
- [ ] `img/somerset-house-2.jpg` — "Skaters on the Somerset House rink in December 2016." (Peter S, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Ice_skating_rink,_Somerset_House_-_geograph.org.uk_-_5233156.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: Love Actually film locations (scenes, addresses)](https://www.movie-locations.com/movies/l/Love-Actually.php)
- [Wikipedia: Love Actually (credits, release dates, list of London locations)](https://en.wikipedia.org/wiki/Love_Actually)
- [Tokyo Fox: London filming locations of Love Actually (running times of scenes)](https://tokyofox.net/2015/12/11/london-filming-locations-love-actually-2004/)
- [Wikipedia: Somerset House (history, architecture)](https://en.wikipedia.org/wiki/Somerset_House)
- [Coordinates of Somerset House as given by Wikipedia, shown on OpenStreetMap](https://www.openstreetmap.org/?mlat=51.5111&mlon=-0.1178#map=19/51.5111/-0.1178)

### 7. Grosvenor Chapel — Love Actually (2003)

`grosvenor-chapel` · 24 South Audley Street, W1K 2PA · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5090453,-0.1512052)

**Camera (estimated)**

- [ ] Position 51.50905, -0.15155, bearing 90° (E) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.50905,-0.15155&heading=90&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. The wedding is an interior scene; for the outside, stand on the opposite (west) pavement of South Audley Street and face the front of the chapel head on, looking east.

**Open questions**

- [ ] The sources say the wedding 'is conducted in' the chapel but do not say whether any exterior shot of the chapel is in the film: the camera estimate is simply the classic view of the front.
- [ ] The chapel's site does not say whether photography is allowed inside: ask at the chapel.

**Visitor access (from the venue's own site, read on 2026-10-06)**

- [ ] The chapel is normally open to visitors Monday to Friday, 8am to 2.30pm. It is also open on Saturdays for Occasional Offices and on Sundays for the 11am Sung Eucharist. ([source](https://www.grosvenorchapel.org.uk/about-1))
- [ ] Exceptions to the opening times are public holidays, private bookings and staff annual leave. ([source](https://www.grosvenorchapel.org.uk/about-1))
- [ ] Photography: the chapel's site says nothing about taking photographs inside. ([source](https://www.grosvenorchapel.org.uk/about-1))

**Images**

- [ ] `img/grosvenor-chapel-1.jpg` — "Grosvenor Chapel from South Audley Street, May 2020." (GrindtXX, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Grosvenor_Chapel_2020.jpg). Check that the caption matches what the photo shows.
- [ ] `img/grosvenor-chapel-2.jpg` — "The front of Grosvenor Chapel in April 2022." (Anthony O'Neil, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Grosvenor_Chapel_-_geograph.org.uk_-_7145381.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: Love Actually film locations (scenes, addresses)](https://www.movie-locations.com/movies/l/Love-Actually.php)
- [Wikipedia: Love Actually (credits, release dates, list of London locations)](https://en.wikipedia.org/wiki/Love_Actually)
- [Wikipedia: Grosvenor Chapel (history)](https://en.wikipedia.org/wiki/Grosvenor_Chapel)
- [OpenStreetMap: coordinates of Grosvenor Chapel](https://www.openstreetmap.org/?mlat=51.5090453&mlon=-0.1512052#map=19/51.5090453/-0.1512052)

### 8. Selfridges — Love Actually (2003)

`selfridges` · 400 Oxford Street, W1A 1AB · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5146022,-0.1528176)

**Camera (estimated)**

- [ ] Position 51.51395, -0.1529, bearing 0° (N) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.51395,-0.1529&heading=0&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. The scene is inside the store, at a jewellery counter that the sources do not locate. The position given is the outside view: south pavement of Oxford Street, facing the store (north).

**Open questions**

- [ ] Interior scene: no source read says where in the store the counter was, or whether it was a real counter. The camera position is therefore the exterior of the building, not the shot.

**Visitor access (from the venue's own site, read on 2026-10-06)**

- [ ] Opening hours listed by Selfridges for the London store: Monday to Friday 10:00–22:00, Saturday 10:00–21:00, Sunday 11:30–18:00. ([source](https://www.selfridges.com/GB/en/features/info/stores/london/))
- [ ] Photography: the store page says nothing about taking photographs inside the store. ([source](https://www.selfridges.com/GB/en/features/info/stores/london/))

**Images**

- [ ] `img/selfridges-1.jpg` — "Christmas decorations on Oxford Street outside Selfridges, November 2017." (Simeon87, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Oxford_Street_Selfridges_Christmas_Decorations_2017.jpg). Check that the caption matches what the photo shows.
- [ ] `img/selfridges-2.jpg` — "Christmas decorations inside Selfridges, December 2016." (Simeon87, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Selfridges_Oxford_Street_London_United_Kingdom_Christmas_Decorations_2016.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: Love Actually film locations (scenes, addresses)](https://www.movie-locations.com/movies/l/Love-Actually.php)
- [Tokyo Fox: London filming locations of Love Actually (running times of scenes)](https://tokyofox.net/2015/12/11/london-filming-locations-love-actually-2004/)
- [Find That Location: Love Actually (scene list)](https://findthatlocation.com/film-title/love-actually)
- [Wikipedia: Selfridges, Oxford Street (history, architecture)](https://en.wikipedia.org/wiki/Selfridges,_Oxford_Street)
- [Wikipedia: Love Actually (credits, release dates, list of London locations)](https://en.wikipedia.org/wiki/Love_Actually)
- [OpenStreetMap: coordinates of Selfridges](https://www.openstreetmap.org/?mlat=51.5146022&mlon=-0.1528176#map=19/51.5146022/-0.1528176)

### 9. 27 St Luke's Mews — Love Actually (2003)

`st-lukes-mews` · 27 St Luke's Mews, W11 1HH · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5177543,-0.2031565)

**Camera (estimated)**

- [ ] Position 51.51781, -0.20318, bearing 160° (S) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.51781,-0.20318&heading=160&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand in the mews facing the pink house on the south side, looking roughly south-south-east at the front door. This is a private home on a narrow residential street: be quick and quiet.

**Open questions**

- [ ] House number: Movie-Locations and Tokyo Fox say no. 27; the caption of the Commons photo used here says 'the pink house is number 22'. In that photo the pink house stands on the same side as the blue house numbered 31, two doors further on, which fits 27 and OpenStreetMap's numbering; please confirm on site.

**Images**

- [ ] `img/st-lukes-mews-1.jpg` — "St Luke's Mews: the pink house on the right, beyond the blue no. 31, is the one identified with the film." (Chris Wood, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:St_Lukes_Mews,_Notting_Hill,_London_(geograph_6086918).jpg). Check that the caption matches what the photo shows.
- [ ] `img/st-lukes-mews-2.jpg` — "St Luke's Mews in June 2025." (Bex Walton, CC BY 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:St_Lukes_Mews_2025-06-14.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Movie-Locations.com: Love Actually film locations (scenes, addresses)](https://www.movie-locations.com/movies/l/Love-Actually.php)
- [Wikipedia: Love Actually (credits, release dates, list of London locations)](https://en.wikipedia.org/wiki/Love_Actually)
- [Tokyo Fox: London filming locations of Love Actually (running times of scenes)](https://tokyofox.net/2015/12/11/london-filming-locations-love-actually-2004/)
- [Wikimedia Commons: photo of St Luke's Mews whose caption gives a different house number](https://commons.wikimedia.org/wiki/File:St_Lukes_Mews,_Notting_Hill,_London_(geograph_6086918).jpg)
- [OpenStreetMap: coordinates of 27 St Luke's Mews](https://www.openstreetmap.org/?mlat=51.5177543&mlon=-0.2031565#map=19/51.5177543/-0.2031565)

### 10. Millennium Bridge and Tate Modern — Harry Potter and the Half-Blood Prince (2009)

`millennium-bridge` · Millennium Bridge, between Peter's Hill and Bankside, EC4V 4AU · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.510173,-0.098438)

**Camera (estimated)**

- [ ] Position 51.5085, -0.0987, bearing 5° (N) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.5085,-0.0987&heading=5&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand at the southern end of the bridge, on Bankside in front of Tate Modern, on the axis of the deck, and look north towards St Paul's Cathedral. For the Fleabag view, the windows of Tate Modern look out over the Thames and St Paul's from above.

**Open questions**

- [ ] Love Actually: the sources only say the bridge is 'briefly seen' about 18 minutes in. None describes what happens in the shot or who is in it: watch the film to confirm before describing it further.
- [ ] Fleabag: Virgin Media places the Tate Modern 'sexhibition' in the final scene of series 1; the Wikipedia paragraph lists it right after the series 2 restaurant, which could be read as series 2. Confirm the episode.
- [ ] 'Top floor of Tate Modern' is not precise: check which room it is and whether it is open to visitors.
- [ ] This location has three works; the data model has one main work (the Harry Potter film, used for the timeline) and lists the other two under 'Also appears in'. Say if you prefer another main work.

**Visitor access (from the venue's own site, read on 2026-10-06)**

- [ ] The Millennium Bridge is a footbridge for pedestrians across the Thames, in the open air. ([source](https://en.wikipedia.org/wiki/Millennium_Bridge,_London))
- [ ] Tate Modern: entry to the collection is free for everyone; booking is recommended for exhibitions, which are paid. Opening times: Sunday to Thursday 10.00–18.00, Friday and Saturday 10.00–21.00. Bags are checked on arrival. ([source](https://www.tate.org.uk/visit/tate-modern))
- [ ] Photography in Tate Modern: 'You can take photos, but make sure the flash is turned off.' ([source](https://www.tate.org.uk/visit/tate-modern/visual-story))
- [ ] Tate describes its Restaurant and Bar, on Level 6 of the Natalie Bell Building, as sitting 'at the top of Tate Modern with panoramic views across the Thames towards St Paul's Cathedral'; it takes reservations and is open Monday to Thursday 12.00–16.30, Friday 12.00–16.00 and 18.45–21.30, Saturday 10.00–16.00 and 18.45–21.30, Sunday 10.00–16.30. No source confirms that this is the room of the Fleabag scene. ([source](https://www.tate.org.uk/visit/tate-modern/restaurant))

**Images**

- [ ] `img/millennium-bridge-1.jpg` — "St Paul's Cathedral and the Millennium Bridge from the south bank." (Alexandre Buisse (Nattfodd), CC BY-SA 3.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:St_Pauls_Cathedral_and_Millennium_Bridge.jpg). Check that the caption matches what the photo shows.
- [ ] `img/millennium-bridge-2.jpg` — "The bridge and Tate Modern seen from the St Paul's side." (Anthony O'Neil, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Millennium_Footbridge_with_Tate_Modern,_from_St_Paul%27s_side_-_geograph.org.uk_-_1859714.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Wikipedia: Millennium Bridge, London (design, opening, film appearances)](https://en.wikipedia.org/wiki/Millennium_Bridge,_London)
- [Wikipedia: Harry Potter and the Half-Blood Prince (film) (credits, filming, release)](https://en.wikipedia.org/wiki/Harry_Potter_and_the_Half-Blood_Prince_(film))
- [The Magician: film-by-film round-up of Harry Potter locations](https://www.the-magician.co.uk/harry-potter-film-locations.htm)
- [Wikipedia: Love Actually (credits, release dates, list of London locations)](https://en.wikipedia.org/wiki/Love_Actually)
- [Tokyo Fox: London filming locations of Love Actually (running times of scenes)](https://tokyofox.net/2015/12/11/london-filming-locations-love-actually-2004/)
- [Almost Ginger: Love Actually filming locations (where the Millennium Bridge shot falls in the film)](https://almostginger.com/?p=16652)
- [Virgin Media: Where was Fleabag filmed?](https://www.virginmedia.com/the-edit/tv/where-was-fleabag-filmed)
- [Wikipedia: Fleabag (creator, episode list, filming locations)](https://en.wikipedia.org/wiki/Fleabag)
- [Wikipedia: Tate Modern (building history)](https://en.wikipedia.org/wiki/Tate_Modern)
- [Coordinates of Millennium Bridge as given by Wikipedia, shown on OpenStreetMap](https://www.openstreetmap.org/?mlat=51.510173&mlon=-0.098438#map=19/51.510173/-0.098438)

### 11. 187 North Gower Street (Speedy's) — Sherlock (2010)

`north-gower-street` · 187 North Gower Street, NW1 2NJ · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.52619,-0.1369017)

**Camera (estimated)**

- [ ] Position 51.52622, -0.13672, bearing 250° (W) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.52622,-0.13672&heading=250&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand on the opposite (east) pavement and face the door beside Speedy's, looking roughly west-south-west. The Mazzini blue plaque by the door is hidden by a prop lamp in the series.

**Open questions**

- [ ] House number: Wikipedia's Sherlock and North Gower Street articles say 187; Wikipedia's 'A Study in Pink' article says 185; the Commons photos of the Mazzini plaque are captioned '183 North Gower Street'. OpenStreetMap places Speedy's at 187. Check the number on the door.
- [ ] The place is dated here by the first broadcast of the series (2010); it is not tied to a single episode.

**Images**

- [ ] `img/north-gower-street-1.jpg` — "Speedy's café at 187 North Gower Street, February 2020." (Matt Brown, CC BY 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Speedy%27s_Cafe.jpg). Check that the caption matches what the photo shows.
- [ ] `img/north-gower-street-2.jpg` — "Speedy's and the blue plaque to Giuseppe Mazzini in January 2011." (Christopher Hilton, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:North_Gower_Street,_NW1,_Speedy%E2%80%99s_caf%C3%A9_and_Mazzini_blue_plaque_-_geograph.org.uk_-_2242863.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Wikipedia: Sherlock (TV series) (creators, production, 221B exterior)](https://en.wikipedia.org/wiki/Sherlock_(TV_series))
- [Wikipedia: North Gower Street (Sherlock filming, Mazzini plaque)](https://en.wikipedia.org/wiki/North_Gower_Street)
- [Wikipedia: A Study in Pink (credits, broadcast, unaired pilot)](https://en.wikipedia.org/wiki/A_Study_in_Pink)
- [Free Tours by Foot: self-guided Sherlock tour of London](https://freetoursbyfoot.com/sherlock-holmes-tour-london/)
- [Virgin Media: Where was Sherlock filmed?](https://www.virginmedia.com/the-edit/tv/where-was-sherlock-filmed)
- [OpenStreetMap: coordinates of Speedy's café, 187 North Gower Street](https://www.openstreetmap.org/?mlat=51.52619&mlon=-0.1369017#map=19/51.52619/-0.1369017)

### 12. Russell Square — Sherlock – A Study in Pink (2010)

`russell-square` · Russell Square, WC1B 5EH · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.52166667,-0.12611111)

**Camera (estimated)**

- [ ] Position 51.5215, -0.1256, bearing 80° (E) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.5215,-0.1256&heading=80&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Inside the gardens, on the eastern half, look east so that the façade of the Imperial Hotel fills the background behind a bench. The sources do not say which bench was used.

**Open questions**

- [ ] The exact bench is not identified by any source read; only the Imperial Hotel backdrop is.
- [ ] Check whether the Imperial Hotel façade still looks as it did in 2010 (not verified with a current source).

**Images**

- [ ] `img/russell-square-1.jpg` — "The Imperial Hotel seen from Russell Square gardens, the backdrop of the bench scene." (Jim Osley, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Imperial_Hotel,_Russell_Square_-_geograph.org.uk_-_5213223.jpg). Check that the caption matches what the photo shows.
- [ ] `img/russell-square-2.jpg` — "The fountains of Russell Square." (mattbuck, CC BY-SA 3.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:London_MMB_L8_Russell_Square.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Wikipedia: Russell Square (history, Sherlock scene)](https://en.wikipedia.org/wiki/Russell_Square)
- [Wikipedia: A Study in Pink (credits, broadcast, unaired pilot)](https://en.wikipedia.org/wiki/A_Study_in_Pink)
- [Wikipedia: Sherlock (TV series) (creators, production, 221B exterior)](https://en.wikipedia.org/wiki/Sherlock_(TV_series))
- [Coordinates of Russell Square as given by Wikipedia, shown on OpenStreetMap](https://www.openstreetmap.org/?mlat=51.52166667&mlon=-0.12611111#map=19/51.52166667/-0.12611111)

### 13. St Bartholomew's Hospital — Sherlock – The Reichenbach Fall (2012)

`st-barts` · West Smithfield, EC1A 7BE · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5175315,-0.0998302)

**Camera (estimated)**

- [ ] Position 51.5179, -0.1014, bearing 100° (E) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.5179,-0.1014&heading=100&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate, low confidence. The sources say only that Sherlock jumps from the hospital roof while John watches from the street, and that a phone box 'shrine' to Sherlock stands outside the hospital on Giltspur Street. The estimate puts you across the road from that phone box, looking east up at the hospital. Which roof it is must be checked against the episode.

**Open questions**

- [ ] Which building: no source read identifies the block or the part of the roof used, nor where John stands. The camera estimate is inferred from the position of the phone-box 'shrine' and needs checking against the episode.
- [ ] The phone-box photo dates from 2018: check whether the box and the fans' messages are still there.

**Images**

- [ ] `img/st-barts-1.jpg` — "The Sherlock Holmes phone box 'shrine' outside the hospital on Giltspur Street, April 2018." (Acabashi, CC BY-SA 4.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Sherlock_Holmes_phone_box,_St_Bart%27s_Hospital,_City_of_London,_England.jpg). Check that the caption matches what the photo shows.
- [ ] `img/st-barts-2.jpg` — "The Henry VIII gate, the West Smithfield entrance to the hospital, seen from inside the grounds." (Robert Lamb, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:View_of_the_West_Smithfield_entrance_to_St._Bartholomew%27s_Hospital_from_the_hospital_grounds_-_geograph.org.uk_-_5165317.jpg). Check that the caption matches what the photo shows.

**Sources used**

- [Wikipedia: The Reichenbach Fall (credits, plot, broadcast)](https://en.wikipedia.org/wiki/The_Reichenbach_Fall)
- [Wikipedia: St Bartholomew's Hospital (history, Sherlock Holmes connections)](https://en.wikipedia.org/wiki/St_Bartholomew%27s_Hospital)
- [Virgin Media: Where was Sherlock filmed?](https://www.virginmedia.com/the-edit/tv/where-was-sherlock-filmed)
- [Wikimedia Commons: photo and description of the Sherlock phone box 'shrine' on Giltspur Street](https://commons.wikimedia.org/wiki/File:Sherlock_Holmes_phone_box,_St_Bart%27s_Hospital,_City_of_London,_England.jpg)
- [OpenStreetMap: coordinates of St Bartholomew's Hospital](https://www.openstreetmap.org/?mlat=51.5175315&mlon=-0.0998302#map=19/51.5175315/-0.0998302)

### 14. Fleabag's café (20 York Rise) — Fleabag (2016)

`york-rise` · 20 York Rise, NW5 1ST · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5586216,-0.1434227)

**Camera (estimated)**

- [ ] Position 51.55862, -0.14358, bearing 90° (E) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.55862,-0.14358&heading=90&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. Stand on the opposite (west) pavement of York Rise and face the shop front of no. 20 square on, looking east. The premises have been refitted since filming.

**Open questions**

- [ ] Current occupant: Time Out (2019) and Wikipedia call it Bold Café & Restaurant; OpenStreetMap now lists a business called 'sis&sibs' at 20 York Rise. Check what is there today.
- [ ] No source read says in which episode the cheese-sandwich scene appears; the place is therefore dated by the series premiere (2016).
- [ ] The street photo does not show the café front itself.

**Images**

- [ ] `img/york-rise-1.jpg` — "Looking up York Rise from Chetwynd Road in January 2017." (Christopher Hilton, CC BY-SA 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:Looking_up_York_Rise_from_Chetwynd_Road,_Kentish_Town_-_geograph.org.uk_-_5259191.jpg). Check that the caption matches what the photo shows.
- [ ] **Missing:** no freely licensed photo of the shop front at 20 York Rise was found on Wikimedia Commons. Take one on site or search again.

**Sources used**

- [Wikipedia: Fleabag (creator, episode list, filming locations)](https://en.wikipedia.org/wiki/Fleabag)
- [Camden New Journal: Scenes for new Fleabag episodes filmed at Kentish Town café](https://www.camdennewjournal.co.uk/article/scenes-for-new-fleabag-episodes-filmed-at-kentish-town-cafe)
- [Time Out London: London on screen – the guinea pig-themed café from Fleabag](https://www.timeout.com/london/news/london-on-screen-the-guinea-pig-themed-cafe-from-fleabag-031919)
- [Virgin Media: Where was Fleabag filmed?](https://www.virginmedia.com/the-edit/tv/where-was-fleabag-filmed)
- [OpenStreetMap: coordinates of 20 York Rise](https://www.openstreetmap.org/?mlat=51.5586216&mlon=-0.1434227#map=19/51.5586216/-0.1434227)

### 15. Smith & Wollensky (The Adelphi) — Fleabag – Episode 1 (2019)

`smith-wollensky` · The Adelphi, 1-11 John Adam Street, WC2N 6HT · [place on Google Maps](https://www.google.com/maps/search/?api=1&query=51.5093559,-0.1221443)

**Camera (estimated)**

- [ ] Position 51.50945, -0.1222, bearing 180° (S) → [open Street View here](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=51.50945,-0.1222&heading=180&pitch=0&fov=80)
- [ ] Shot note to confirm or rewrite: Estimate. The dinner is an interior scene. For the outside, stand on the north pavement of John Adam Street and face the Adelphi building, looking south. Which door is the restaurant entrance was not confirmed.

**Open questions**

- [ ] The building: Virgin Media describes it as 'the old Adelphi Hotel building … the last survivor of the 18th-century neoclassical terrace', with a 1930s art deco interior; the Commons description calls it the New Adelphi, an Art Deco building of 1936-38. These do not agree on the age of the building.
- [ ] The restaurant's site does not say whether visitors who are not dining may enter to look or take photographs: ask the restaurant.
- [ ] Interior scene: the camera position is the street outside, not the shot. No source read describes the dinner in detail (who is at the table, what happens): add that only after checking the episode.

**Visitor access (from the venue's own site, read on 2026-10-06)**

- [ ] The restaurant is open: its site lists opening times Monday to Thursday 12:00–22:00, Friday and Saturday 12:00–22:30, Sunday 12:00–21:30 (last orders), and says exceptions may apply without prior notice. ([source](https://www.smithandwollensky.co.uk/find-us/))
- [ ] Tables are booked through the 'Book a table' link on the restaurant's site; bookings of 12 or more people are made by phone. ([source](https://www.smithandwollensky.co.uk/find-us/))
- [ ] The site does not say whether people who are not dining may come in to look, and says nothing about photography. ([source](https://www.smithandwollensky.co.uk/find-us/))

**Images**

- [ ] `img/smith-wollensky-1.jpg` — "The Adelphi building on John Adam Street, which houses the restaurant." (Fred Romero, CC BY 2.0, via Wikimedia Commons) → [Commons page](https://commons.wikimedia.org/wiki/File:London_-_The_Adelphi_(31931338322).jpg). Check that the caption matches what the photo shows.
- [ ] **Missing:** no freely licensed photo of the restaurant entrance or interior was found on Wikimedia Commons.

**Sources used**

- [Wikipedia: Fleabag (creator, episode list, filming locations)](https://en.wikipedia.org/wiki/Fleabag)
- [Virgin Media: Where was Fleabag filmed?](https://www.virginmedia.com/the-edit/tv/where-was-fleabag-filmed)
- [Wikimedia Commons: photo and description of the Adelphi building, John Adam Street](https://commons.wikimedia.org/wiki/File:London_-_The_Adelphi_(31931338322).jpg)
- [OpenStreetMap: coordinates of Smith & Wollensky, John Adam Street](https://www.openstreetmap.org/?mlat=51.5093559&mlon=-0.1221443#map=19/51.5093559/-0.1221443)

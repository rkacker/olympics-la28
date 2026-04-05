# Olympics LA28

Structured data for the **LA 2028 Olympic Games** competition schedule, extracted from the [official LA28 competition schedule PDFs](https://la28.org/en/games-plan/olympics.html).

This repo provides clean, machine-readable JSON and CSV files covering all 843 sessions across 58 sports, 52 venues, and 21 competition days (July 10–30, 2028). It also includes a demo interactive map visualization.

## Data

All data files are in [`data/`](data/):

| File | Description |
|------|-------------|
| `schedule.json` | All 843 sessions with full detail |
| `schedule.csv` | Same data in CSV format |
| `venues.json` | Venue geocoding (lat/lng), zones, and local names |
| `sports.json` | Sport list with category groupings |

### Schedule Schema

Each entry in `schedule.json` represents one competition session:

```json
{
  "sport": "Athletics (Track & Field)",
  "venue": "LA Memorial Coliseum",
  "zone": "Exposition Park",
  "session_code": "ATH01",
  "date": "2028-07-15",
  "day_of_week": "Saturday",
  "games_day": 1,
  "session_type": "Preliminary",
  "events": [
    "Women's 100m Preliminary",
    "Men's 100m Preliminary"
  ],
  "start_time": "09:00",
  "end_time": "13:30",
  "times_are_local": "PT"
}
```

- `games_day`: Day relative to the Opening Ceremony (Day 0 = July 14). Ranges from -4 to 16.
- `times_are_local`: `"PT"` for Pacific Time, `"OKC"` for Oklahoma City local time (Central Time).
- `events`: Individual events/rounds within the session.

### Venue Schema

`venues.json` maps official LA28 venue names to geographic data:

```json
{
  "2028 Stadium": {
    "local_name": "SoFi Stadium",
    "lat": 33.9535,
    "lng": -118.3392,
    "zone": "Inglewood",
    "city": "Inglewood",
    "state": "CA",
    "is_la_area": true
  }
}
```

- `local_name`: The commonly known name (LA28 uses generic names for sponsorship reasons).
- `is_la_area`: `true` for greater LA venues, `false` for remote venues (OKC, NYC, Nashville, etc.).

### Sports Schema

`sports.json` lists all 58 sports with category groupings:

```json
{
  "sport": "Swimming",
  "category": "Aquatics",
  "session_count": 17
}
```

Categories: Aquatics, Athletics, Ball Sports, Combat Sports, Cycling, Gymnastics, Other, Racquet Sports, Shooting & Archery, Water Sports.

## Data Extraction

The source PDFs are in [`pdfs/`](pdfs/). To re-run the extraction:

```bash
# Requires Python 3.9+ and pdfplumber
uv run --with pdfplumber python scripts/extract_schedule.py

# Or with pip
pip install pdfplumber
python scripts/extract_schedule.py
```

## Demo Visualization

An interactive map explorer built with React, Leaflet, and shadcn/ui. Shows LA-area venues on a map with date and sport filtering.

```bash
cd demo
npm install
npm run dev
```

Then open http://localhost:5173.

Features:
- Interactive Leaflet map of LA-area Olympic venues
- Circle markers sized and colored by number of active sessions
- Date slider to scrub through all 21 competition days
- Sport filter with category groupings and session counts
- Session list with event details
- Venue popups showing scheduled sessions
- Non-LA venues (soccer, softball, canoe slalom) listed separately

## Data Source

All schedule data is from the [LA28 Official Competition Schedule v3.0](https://la28.org/en/games-plan/olympics.html) (as of March 16, 2026). The schedule is subject to change until the conclusion of the Games.

## License

MIT

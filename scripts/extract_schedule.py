"""
Extract structured schedule data from the LA28 Olympic Games Competition Schedule PDF.

Source: LA28OlympicGamesCompetitionScheduleByEventV3.0.pdf
Output: data/schedule.json, data/schedule.csv

Usage:
    uv run --with pdfplumber python scripts/extract_schedule.py
"""

import csv
import json
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "pdfs" / "LA28OlympicGamesCompetitionScheduleByEventV3.0.pdf"
OUT_DIR = ROOT / "data"

HEADER = [
    "Sport", "Venue", "Zone", "Session Code", "Date",
    "Games Day", "Session Type", "Session Description", "Start Time", "End Time",
]

# Days of the week for date parsing
DAYS_OF_WEEK = {
    "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed",
    "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun",
}

MONTH_MAP = {"July": "07", "August": "08"}


def clean_time(raw: str) -> str:
    """Extract HH:MM time, stripping timezone annotations like 'OKC Local Time (CT)'."""
    if not raw:
        return ""
    match = re.match(r"(\d{1,2}:\d{2})", raw.strip())
    return match.group(1) if match else raw.strip()


def has_okc_time(raw: str) -> bool:
    """Check if time field contains OKC local time annotation."""
    return bool(raw and "OKC" in raw)


def parse_date(raw: str) -> tuple[str, str]:
    """Parse 'Sunday, July 16' -> ('2028-07-16', 'Sunday')."""
    if not raw:
        return ("", "")
    raw = raw.strip()
    match = re.match(r"(\w+),\s+(\w+)\s+(\d+)", raw)
    if not match:
        return ("", "")
    day_name, month, day = match.groups()
    month_num = MONTH_MAP.get(month, "07")
    return (f"2028-{month_num}-{int(day):02d}", day_name)


def parse_events(description: str) -> list[str]:
    """Split multi-line session description into individual events."""
    if not description:
        return []
    return [e.strip() for e in description.split("\n") if e.strip()]


def extract_sessions(pdf_path: Path) -> list[dict]:
    """Extract all sessions from the ByEvent PDF."""
    sessions = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row or len(row) < 10:
                        continue
                    # Skip header rows and disclaimer
                    if row[0] in ("Sport", None, "") or "schedule" in str(row[0]).lower():
                        continue
                    if "competition schedule" in str(row[0]).lower():
                        continue

                    sport = " ".join((row[0] or "").split())
                    if not sport:
                        continue

                    date_iso, day_of_week = parse_date(row[4])
                    if not date_iso:
                        continue

                    start_raw = row[8] or ""
                    end_raw = row[9] or ""
                    is_okc_time = has_okc_time(start_raw) or has_okc_time(end_raw)

                    session = {
                        "sport": sport,
                        "venue": " ".join((row[1] or "").split()),
                        "zone": " ".join((row[2] or "").split()),
                        "session_code": (row[3] or "").strip(),
                        "date": date_iso,
                        "day_of_week": day_of_week,
                        "games_day": int(row[5]) if row[5] and row[5].strip().lstrip("-").isdigit() else None,
                        "session_type": (row[6] or "").strip(),
                        "events": parse_events(row[7]),
                        "start_time": clean_time(start_raw),
                        "end_time": clean_time(end_raw),
                        "times_are_local": "OKC" if is_okc_time else "PT",
                    }
                    sessions.append(session)
    return sessions


def write_json(sessions: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(sessions, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(sessions)} sessions to {path}")


def write_csv(sessions: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "sport", "venue", "zone", "session_code", "date", "day_of_week",
        "games_day", "session_type", "events", "start_time", "end_time",
        "times_are_local",
    ]
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for s in sessions:
            row = {**s, "events": "; ".join(s["events"])}
            writer.writerow(row)
    print(f"Wrote {len(sessions)} sessions to {path}")


def main():
    print(f"Extracting from: {PDF_PATH}")
    sessions = extract_sessions(PDF_PATH)
    print(f"Extracted {len(sessions)} sessions")

    # Summary stats
    sports = sorted(set(s["sport"] for s in sessions))
    venues = sorted(set(s["venue"] for s in sessions))
    dates = sorted(set(s["date"] for s in sessions))
    print(f"  Sports: {len(sports)}")
    print(f"  Venues: {len(venues)}")
    print(f"  Dates: {dates[0]} to {dates[-1]}")

    write_json(sessions, OUT_DIR / "schedule.json")
    write_csv(sessions, OUT_DIR / "schedule.csv")


if __name__ == "__main__":
    main()

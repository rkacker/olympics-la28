export interface Session {
  sport: string;
  venue: string;
  zone: string;
  session_code: string;
  date: string;
  day_of_week: string;
  games_day: number | null;
  session_type: string;
  events: string[];
  start_time: string;
  end_time: string;
  times_are_local: string;
  has_gold_medal: boolean;
  has_bronze_medal: boolean;
}



export interface Venue {
  local_name: string | null;
  lat: number;
  lng: number;
  zone: string;
  city: string;
  state: string;
  is_la_area: boolean;
}

export interface Sport {
  sport: string;
  category: string;
  session_count: number;
}

export type Venues = Record<string, Venue>;

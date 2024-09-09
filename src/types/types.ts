export interface Coordinates {
  lat: number;
  lon: number;
}

export type NominatimSuggestion = {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: {
    [key: string]: string;
  };
};

export type reactionType = { reactingUserId: string; reactionType: string };

import haversine from "haversine-distance";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const calculateDistance = (
  coords1: Coordinates,
  coords2: Coordinates,
): number => {
  return haversine(coords1, coords2) / 1000; // Convert meters to kilometers
};

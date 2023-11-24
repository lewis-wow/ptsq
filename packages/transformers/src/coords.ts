/**
 * Transform tuple of coordinates into latitute and longitute object
 *
 * @see https://en.wikipedia.org/wiki/Geographic_coordinate_system
 */
export const coords = (
  value: [number, number] | { lat: number; lng: number },
) => (Array.isArray(value) ? { lat: value[0], lng: value[1] } : value);

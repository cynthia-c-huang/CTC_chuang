/**
 * The client side of the API: helpers the frontend uses to call the endpoints.
 *
 * Don't confuse this with `app/api/`, which is the other side of the same
 * boundary - the route handlers that *implement* those endpoints. This file
 * only ever talks to them over HTTP.
 *
 * The shapes these helpers return live in `lib/types.ts`, shared with the
 * handlers that produce them.
 */
import type { Restaurant } from './types';
//gives TypeScript a clear description of what kinds of filter options getRestaurants() is allowed to receive.
//does not validate user input at runtime; it only helps while writing TypeScript.
type RestaurantFilters = {
  name?: string; //optional, must be a string
  cuisine?: string;
  minRating?: number;
};
// We read a base URL from the environment because Server Components fetch on
// the server, where relative URLs don't resolve - so we need an absolute origin.
// It's the same app on the same port, so this is normally just localhost:3000.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch every restaurant from the API.
 *
 * NOTE: this is a bare fetch with no error handling. It does not check the
 * response status and it does not catch network failures - callers get whatever
 * `res.json()` produces, including on a 500.
 */
//filters? is the parameter name and is optional with type RestaurantFilters
export async function getRestaurants(filters?: RestaurantFilters): Promise<Restaurant[]> {
  const params = new URLSearchParams(); //a helper object for building the part of a URL that comes after the ?
  //first checks whether filters exists. If undefined, filters?.name results to undefined, otherwise fetches filters.name
  if (filters?.name) {
    params.set('name', filters.name); //stores: name = rusty
  }

  if (filters?.cuisine) {
    params.set('cuisine', filters.cuisine);
  }

  if (filters?.minRating !== undefined) {
    params.set('minRating', String(filters.minRating));
  }
  const queryString = params.toString(); //turns into name=rusty&cuisine=Italian&minRating=4
  //decides whether to add the ? for filters based on if queryString is empty or not
  const url = queryString
  ? `${API_URL}/api/restaurants?${queryString}`
  : `${API_URL}/api/restaurants`;
  const res = await fetch(url, { cache: 'no-store' }); //the app always asks your API for the latest restaurant data.
  return res.json();
}

/**
 * Fetch a single restaurant by id.
 */
export async function getRestaurant(id: number | string): Promise<Restaurant> {
  const res = await fetch(`${API_URL}/api/restaurants/${id}`, { cache: 'no-store' });
  return res.json();
}

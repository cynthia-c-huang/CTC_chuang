'use client'; //this component can use useState, button clicks, input events, etc.

import { useState } from 'react';
import { getRestaurants } from '@/lib/apiClient';
import type { Restaurant } from '@/lib/types';

const cuisines = [
  'American',
  'Chinese',
  'Japanese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Indian',
  'Italian',
  'Mexican',
  'Mediterranean',
  'French',
  'Greek',
  'Middle Eastern',
  'Spanish',
  'Brazilian',
  'Caribbean',
  'Vegetarian',
  'Vegan',
  'Seafood',
  'Bakery',
];

const ratingOptions = Array.from(
  { length: 10 },
  (_, i) => (i + 1) * 0.5
);

//describes the data that page.tsx passes into this component.
type RestaurantsProps = {
  initialRestaurants: Restaurant[]; //the prop called initialRestaurants must be an array of Restaurant objects.
};
//extracting that prop initialRestaurants
export default function Restaurants({
  initialRestaurants,
}: RestaurantsProps) {
    const [restaurants, setRestaurants] = useState(initialRestaurants); //creates client-side state.
    const [name, setName] = useState('');
    const [cuisine, setCuisine] = useState('');
    //undefined means any rating
    const [minRating, setMinRating] = useState<number | undefined>(undefined);
    async function handleSearch() { //gets the filtered restaurants from getRestaurants call in apiClient
        const filteredRestaurants = await getRestaurants({
        name, cuisine, minRating,
        });
        setRestaurants(filteredRestaurants); //sets viewed restaurants to be the filteredRestaurants
    }
  //The reason for the outer <div> is that React needs one parent element around both the search controls and the restaurant list
  //mb-4 = margin-bottom
// flex = lay the children out in a row
// gap-2 = put some space between them
  return (
    <div>
    <div className="mb-4 flex gap-2">
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search restaurants by name"
            className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
            >
            <option value="">All cuisines</option>

            {cuisines.map((item) => (
                <option key={item} value={item}>
                {item}
                </option>
            ))}
        </select>

        <select
            value={minRating ?? ''}
            onChange={(e) =>
                setMinRating(
                e.target.value === ''
                    ? undefined
                    : Number(e.target.value)
                )
            }
            className="rounded-lg border border-gray-300 px-3 py-2"
            >
            <option value="">Any rating</option>

            {ratingOptions.map((rating) => (
                <option key={rating} value={rating}>
                {rating}
                </option>
            ))}
        </select>
        <button
            onClick={handleSearch}
            className="rounded-lg bg-black px-4 py-2 text-white"
        >
            Search
        </button>
    </div>
    <ul className="space-y-3">
      {restaurants.map((restaurant) => (
        <li
          key={restaurant.id}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{restaurant.name}</span>

            <span className="text-sm text-gray-500">
              {restaurant.rating}★
            </span>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            {restaurant.cuisine} · {restaurant.address}
          </div>
        </li>
      ))}
    </ul>
    </div>
  );
}
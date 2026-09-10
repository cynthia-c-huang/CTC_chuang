import { getRestaurants } from '@/lib/apiClient';
import Restaurants from '@/components/Restaurants';

// Server component. Fetches restaurants on each request and renders a plain
// list. There is no loading state, no empty state, and no error handling: if
// the API is down or returns something unexpected, this throws.
export default async function HomePage() {
  const restaurants = await getRestaurants();
  //restaurants is the data the server initially fetched. We pass that into Restaurants.tsx initialRestaurants as a prop
  //type RestaurantsProps tells TypeScript this component expects to receive a prop named initialRestaurants, and it should be an array of restaurants
  
  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Restaurants</h2>
      <Restaurants initialRestaurants={restaurants} />
    </div>
  );
}

import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';
import { validateRestaurantBody } from '@/lib/validateBody';

/**
 * GET /api/restaurants
 * Returns all restaurants.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const name = searchParams.get('name');
    const cuisine = searchParams.get('cuisine');
    const minRating = searchParams.get('minRating');
    //validate that minRating is a number from 0 to 5 or null
    let minRatingValue: number | null = null;

    if (minRating !== null) {
      minRatingValue = Number(minRating);

      if ( //NaN.isFinite returns false, checks if 0 <= minRating <= 5 or not
        !Number.isFinite(minRatingValue) ||
        minRatingValue < 0 ||
        minRatingValue > 5
      ) {
        return NextResponse.json(
          { error: 'minRating must be a number between 0 and 5' },
          { status: 400 }
        );
      }
    }
    //values and conditions for search and filter query
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (name) { //run only when name is not null, not undefined, and not an empty string
      values.push(`%${name}%`);
      conditions.push(`name ILIKE $${values.length}`); //ILIKE is a special keyword used to search for text patterns without caring about capital or lowercase letters
    }
    if (cuisine) {
      values.push(`%${cuisine}%`);
      conditions.push(`cuisine ILIKE $${values.length}`); //the SQL placeholders need to become $1, $2, $3
    }
    if (minRatingValue !== null) { //since 0 is a valid rating, we check that it is not null instead
      values.push(minRatingValue);
      conditions.push(`rating >= $${values.length}`);
    }
    let query = 'SELECT * FROM restaurants';
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows.map(toRestaurant));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/restaurants
 * Create a new restaurant.
 *
 * TODO (A2): implement. Read the restaurant fields from the request body,
 * insert a row, and return the created restaurant with a 201 status.
 *
 * TODO (A3): validate before you insert. Nothing validates anything today, so
 * `rating` happily accepts 6. Decide what valid means for each field and reject
 * bad bodies with a 400 rather than letting them reach the database.
 */
export async function POST(_req: Request) {
  try {
    const body = await _req.json(); //reads the incoming JSON body.
    const validationError = validateRestaurantBody(body);
    if(validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }
    const { name, cuisine, address, rating } = body; //destructuring pulls out the four restaurant fields and saves into variables
    const { rows } = await pool.query( //pool.query sends SQL to PostgreSQL to insert the restaurant
    `INSERT INTO restaurants (name, cuisine, address, rating)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [name, cuisine, address, rating]
    ); //RETURNING * gives you the row that was just inserted.
    //toRestaurant(...) converts the raw DB row into the API shape.
    //201 tells the caller a resource was successfully created.
    return NextResponse.json(toRestaurant(rows[0]), { status: 201 });
  } catch(err) {
    return handleError(err);
  }
}

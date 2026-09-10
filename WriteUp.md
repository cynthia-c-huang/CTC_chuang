# Write-up

## 1. What did you build for Part B, and why that?

I decided to build a search and filter feature for Brennen. As his list of restaurants grows, he'll likely want to come back to a specific restaurant by searching for by name, revisit all the restaurants he ranked highly (minimum rating filter), and find restaurants of a certain cuisine.

I picked this over features like a total-spending counter, restaurant notes, or additional rating categories because filtering becomes more useful as more restaurant data is added. For example, future fields such as price range or service rating could later become additional filters. I also felt this was a useful feature I could finish end-to-end within the scope of the challenge rather than starting a larger feature and leaving it incomplete.

## 2. What did you decide, and what did you rule out?

I extended the existing GET /api/restaurants endpoint with optional name, cuisine, and minRating query parameters instead of creating a separate search endpoint. Since filtering is still retrieving the restaurant collection, I decided to keep it on the existing route since it felt simpler and more consistent.

One of the biggest things was deciding to split the frontend display. I kept page.tsx as a server component for the initial restaurant fetch, but moved the interactive list into a new component Restaurants.tsx to handle the search/filter UI and return the filtered restaurants. Since the page now needed to react to user input in the browser, this new client component could use the necessary useState, onChange, and onClick.

This keeps the client-side state limited to the part of the page that actually needs it and preserves server-side fetching for the initial list. However, I’m not entirely sure this boundary will remain the best choice as the page grows. For example, if future features need to share client state between the restaurant list and other page-level UI, I'd need to lift the state into a larger client component, which may be complicated.

Another tradeoff I made was I kept the selectable cuisines to a fixed list and minimum rating to 0.5-point increments. I also used an explicit "search" button instead of live filtering while typing. These choices reduced complexity, although the biggest perhaps oversimplifcation was the fixed cuisine list if future restaurants grow in variety and complexity (i.e. fusion restaurants). 


## 3. Where did you cut corners?

In another day, I'd probably revamp my current fixed cuisine list, which forces a drop-down menu but was simpler than a search, into the search bar itself so that Brennen can search for both a cuisine and a name. As well, I also would have added a live search, where the restaurants would rerender as the user types, since currently, it only filters after pressing the search button.

## 4. Where should we look first?

Start with `client/app/api/restaurants/route.ts` to see how the optional query parameters are validated and translated into SQL. 

Then look at `client/components/Restaurants.tsx` for the search/filter UI and state management, and then `client/lib/apiClient.ts` for how the frontend builds the query string.
---

## Part B: routes

| Method and path | What it does | Success | Errors       |
| --------------- | ------------ | ------- | ------------ |
| `GET /api/restaurants?name=&cuisine=&minRating=` | Returns restaurants matching any supplied filters | `200` + array of restaurants | `400` if `minRating` is not a number from 0 to 5 |

The query parameters are optional:

- `name`: case-insensitive, partial match
- `cuisine`: case-insensitive, partial match
- `minRating`: minimum rating from 0 to 5 (UI allows in 0.5 increments)

Multiple filters are combined with AND. With no query parameters, the endpoint keeps its original behavior and returns all restaurants. If no restaurants match, it returns `200` with an empty array.

## Schema changes

None

## How I verified this

**Part A** - the contract table in CHALLENGE.md, every row including the error
cases:

```bash
# e.g.
curl -i http://localhost:3000/api/restaurants          # 200 + array
curl -i http://localhost:3000/api/restaurants/99999    # 404
curl -i http://localhost:3000/api/restaurants/abc      # 404
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Out Of Range","rating":6}'              # 400
curl -i http://localhost:3000/api/restaurants/8        # 200 returns row
#POST
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"El Fuego","cuisine":"Mexican","address":"2 Vermont St","rating":4.5}' # 201 w created row
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"El Fuego","cuisine":"Mexican","address":"2 Vermont St","rating":45}' # 400 bad request, rating must be a # 0...5
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"","cuisine":"Mexican","address":"2 Vermont St","rating":4.5}' # 400 bad request, name is required and nonempty
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"             ","cuisine":"Mexican","address":"2 Vermont St","rating":4.5}' # 400 bad request, name is required and nonempty

#PUT
curl -i -X PUT http://localhost:3000/api/restaurants/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"The Rustic Fork","cuisine":"American","address":"12 Main St","rating":4.5}' # 200 updated row with valid ID

curl -i -X PUT http://localhost:3000/api/restaurants/2 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Waterlily"}'     # 200 updated valid row, cleared other inputs like cuisine, address, rating to null

curl -i -X PUT http://localhost:3000/api/restaurants/101 \
  -H 'Content-Type: application/json' \
  -d '{"name":"The Rustic Fork","cuisine":"American","address":"12 Main St","rating":4.5}' #404 restaurant not found

curl -i -X PUT http://localhost:3000/api/restaurants/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"","cuisine":"American","address":"12 Main St","rating":4.5}' #400 bad request

#DELETE
curl -i -X DELETE http://localhost:3000/api/restaurants/4 # 204 no content, deleted restaurant with id 4 (Valid)
curl -i -X DELETE http://localhost:3000/api/restaurants/2020 # 404 not found, restaurant does not exist
curl -i -X DELETE http://localhost:3000/api/restaurants/-1 # 404 not found
curl -i -X DELETE http://localhost:3000/api/restaurants/abc # 404 not found


```

**Part B** - the equivalent cases for what you built:

```bash
curl -i "http://localhost:3000/api/restaurants?name=rusty" #returns the row with Rusty Spoon
curl -i "http://localhost:3000/api/restaurants?cuisine=Italian" #returns all restaurants that are Italian, in this case, only Bella Napoli
curl -i "http://localhost:3000/api/restaurants?minRating=4" #returns all restaurants with a minimum rating of 4: Bella Napoli, Rusty Spoon
curl -i "http://localhost:3000/api/restaurants?cuisine=Italian&minRating=4" #returns Bella Napoli
curl -i "http://localhost:3000/api/restaurants?minRating=6" # 400 bad request, minRating must be bt 0 and 5
curl -i "http://localhost:3000/api/restaurants?minRating=abc" # 400 bad request, minRating must be bt 0 and 5
curl -i "http://localhost:3000/api/restaurants?cuisine=Swiss" # 200 returns an empty array. This is expected behavior. Although Swiss cuisine is not in the filter list, future functionality may add more cuisines, keeping backend consistent.
curl -i "http://localhost:3000/api/restaurants?name=bobby"  # 200 returns an empty array. This is expected behavior. Searching for a restaurant by name when no restaurant with said name exists should return nothing.
```

## Known issues / what I'd do next

Adding duplicate restaurants is still allowed in the DB since there's no explitit UNIQUE rule for a name or address. While restaurants can share the same name and address (if city and/or state are not specified), it's more logical to prevent Brennen from rerecording a restaurant rather than simply adding another visit/updating restaurant info.

I chose not to handle a 409 duplicate error since part A did not specify if I could alter the schema, and what exactly counts as a duplicate restaurant also was not specified.
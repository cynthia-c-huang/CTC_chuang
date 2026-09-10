
export function validateRestaurantBody(body: unknown): string | null {
    if ( //ensure that body is a JSON object
        typeof body !== 'object' ||
        body === null ||
        Array.isArray(body)
    ) {
        return 'Request body must be a JSON object';
    }

    const { name, cuisine, address, rating } = body as {
        name?: unknown;
        cuisine?: unknown;
        address?: unknown;
        rating?: unknown;
    };
    if (typeof name !== 'string' || name.trim().length === 0) {
        return 'Name is required and must be a nonempty string';
    }
    if (
        rating !== null &&
        rating !== undefined &&
        (typeof rating !== 'number' || rating < 0 || rating > 5)
    ) {
        return 'Rating must be a number between 0 and 5';
    }
    if(address !== null && address !== undefined && typeof address !== 'string') {
        return 'Address must be a string';
    }
    if(cuisine !== null && cuisine !== undefined && typeof cuisine!== 'string') {
        return 'Cuisine must be a string';
    }
    return null;
}
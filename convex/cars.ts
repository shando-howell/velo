import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Step 1: Generate the short-lived upload URL
export const generateUploadUrl = mutation(
    async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    }
);

// Step 2: Save the car data and the storageId
export const addCar = mutation({
    args: {
        make: v.string(),
        model: v.string(),
        year: v.number(),
        price: v.number(),
        imageId: v.id("_storage"), // This is the ID returned after upload,
        isAvailable: v.boolean()
    },
    handler: async (ctx, args) => {
        const carId = await ctx.db.insert("cars", {
            make: args.make,
            model: args.model,
            year: args.year,
            price: args.price,
            imageId: args.imageId,
            isAvailable: true,
        });
        return carId;
    },
});

// Step 3: Helper to get the actual image URL for the frontend
export const getImageUrl = query({
    args: {storageId: v.id("_storage")},
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

export const getPaginatedListings = query({
    args: {paginationOpts: v.any()},
    handler: async (ctx, args) => {
        const paginatedListings = await ctx.db
            .query("cars")
            .order("desc")
            .paginate(args.paginationOpts)

        return paginatedListings 
    }
})

export const getPaginatedInventory = query({
    args: { paginationOpts: v.any()},
    handler: async (ctx, args) => {
        const paginatedCars = await ctx.db
            .query("cars")
            .order("desc") // Newest additions first
            .paginate(args.paginationOpts);

        // Map through the paginated batch to include the actual image URL
        const results = await Promise.all(
            paginatedCars.page.map(async (car) => ({
                ...car,
                imageUrl: car.imageId ? await ctx.storage.getUrl(car.imageId) : null,
            }))
        );

        // Return the updated array along with the pagination status objects
        return {
            ...paginatedCars,
            page: results
        };
    },
});

export const getCarById = query({
    args: { id: v.id("cars")},
    handler: async (ctx, args) => {
        const car = await ctx.db.get(args.id);
        if (!car) {
            return null;
        }

        return {
            ...car,
            imageUrl: car.imageId ? await ctx.storage.getUrl(car.imageId): null,
        };
    },
});

// Update car listing
export const updateCar = mutation({
    args: {
        id: v.id("cars"),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        price: v.number()
    },
    handler: async (ctx, args) => {
        const {id, ...updates} = args;

        // Updates only the provided fields, leaving imageId intact
        await ctx.db.patch(id, updates);
    },
});

// Delete mutation (Deleting both DB record and storage file)
export const deleteCar = mutation({
    args: {id: v.id("cars")},
    handler: async (ctx, args) => {
        const car = await ctx.db.get(args.id);
        if (!car) {
            throw new Error("Car not found.");
        }

        // Step 1: Delete the image from Convex Storage if it exists
        if (car.imageId) {
            await ctx.storage.delete(car.imageId);
        }

        // Step 1: Delete the car document from the database
        await ctx.db.delete(args.id);
    },
});

// Get the latest listings query
export const getLatestListings = query({
    handler: async (ctx) => {
        // Fetch the 3 most recently added cars
        const cars = await ctx.db
            .query("cars")
            .order("desc")
            .take(3);

        // Mapping through the cars to resolve the storageId into a public URL
        return Promise.all(
            cars.map(async (car) => ({
                ...car,
                imageUrl: car.imageId
                    ? await ctx.storage.getUrl(car.imageId)
                    : null
            }))
        );
    },
}); 
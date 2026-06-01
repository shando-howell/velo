import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
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
            imageId: args.imageId
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

export const getPaginatedCars = query({
    args: { paginationOpts: paginationOptsValidator},
    handler: async (ctx, args) => {
        // 1. Fetch the requested slice of database documents
        const paginatedCars = await ctx.db
            .query("cars")
            .order("desc") // Newest additions first
            .paginate(args.paginationOpts);

        const now = Date.now();

        // 2. Resolve image pointers and parse real-time transaction locks
        const mappedPage = await Promise.all(
            paginatedCars.page.map(async (car) => {
                let resolvedImageUrl = car.imageId;
                if (!resolvedImageUrl.startsWith("http")) {
                    resolvedImageUrl = (await ctx.storage.getUrl(car.imageId)) ?? "";
                }

                const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

                return {
                    ...car,
                    imageUrl: resolvedImageUrl,
                    isAvailable,
                };
            })
        );

        // Return the modified payload to the client hook
        return {
            ...paginatedCars,
            page: mappedPage,
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

        let resolvedImageUrl = car.imageId;
        if (!resolvedImageUrl.startsWith("http")) {
            resolvedImageUrl = await ctx.storage.getUrl(car.imageId) ?? "";
        }

        // The OCC Lock Logic
        const now: number = Date.now();
        const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

        return {
            ...car,
            imageUrl: resolvedImageUrl,
            isAvailable
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

export const getAllCars = query({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch the raw inventory from the DB
        const cars = await ctx.db.query("cars").collect();

        // 2. Capture the exact server time for evaluation
        const now = Date.now();

        // 3. Map over the inventory to evaluate the leases
        return Promise.all(cars.map(async (car) => {
            // Hybrid Image Resolver
            let resolvedImageUrl = car.imageId;

            if (!resolvedImageUrl.startsWith("http")) {
                resolvedImageUrl = await ctx.storage.getUrl(car.imageId) ?? "";
            }

            // OCC Logic: The car is available only if the lease doesn't exist,
            // or if the expiration timestamp is in the past.
            const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

            return {
                ...car,
                imageUrl : resolvedImageUrl,
                isAvailable,
            };
        }));
    },
});

export const getSalesStaff = query({
    args: {},
    handler: async (ctx) => {
        const staff = await ctx.db.query("salesStaff").collect();
        const now = Date.now();

        return staff.map((member) => {
            const isAvailable = !member.leaseExpiresAt || member.leaseExpiresAt < now;

            return {
                ...member,
                isAvailable,
            };
        });
    },
});
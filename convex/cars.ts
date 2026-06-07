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
        status: v.string(),
        imageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const newCarId = await ctx.db.insert("cars", {
            make: args.make,
            model: args.model,
            year: args.year,
            price: args.price,
            status: args.status,
            imageId: args.imageId
        });
        return newCarId;
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
                let imageUrl = null;

                if (car.imageId) {
                    imageUrl = await ctx.storage.getUrl(car.imageId);
                }

                const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

                return {
                    ...car,
                    imageUrl,
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

        let imageUrl = null;

        if (car.imageId) {
            imageUrl = await ctx.storage.getUrl(car.imageId);
        }

        // The OCC Lock Logic
        const now: number = Date.now();
        const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

        return {
            ...car,
            imageUrl,
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

        const now = Date.now();

        // Mapping through the cars to resolve the storageId into a public URL
        const mappedCars = await Promise.all(
            cars.map(async (car) => {
                let imageUrl = null;

                if (car.imageId) {
                    imageUrl = await ctx.storage.getUrl(car.imageId)
                }
            
                const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

                return {
                    ...car,
                    imageUrl,
                    isAvailable
                }
            })
        );

        return mappedCars
    },
}); 

export const getAllCars = query({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch the raw inventory from the DB
        const cars = await ctx.db.query("cars").order("desc").collect();

        // 2. Capture the exact server time for evaluation
        const now = Date.now();

        // 3. Map over the inventory to evaluate the leases
        return Promise.all(cars.map(async (car) => {
            let imageUrl = null;

            if (car.imageId) {
                imageUrl = await ctx.storage.getUrl(car.imageId);
            }

            // OCC Logic: The car is available only if the lease doesn't exist,
            // or if the expiration timestamp is in the past.
            const isAvailable = !car.leaseExpiresAt || car.leaseExpiresAt < now;

            return {
                ...car,
                imageUrl,
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
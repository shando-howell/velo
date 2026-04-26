"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

export default function InventoryPage() {
    const cars = useQuery(api.cars.getInventory);

    if (cars === undefined) {
        return (
            <p>Loading inventory...</p>
        )
    }

    return (
        <main className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">
                Current Inventory
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <div key={car._id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        {/* Image Container */}
                        <div className="relative h-48 w-full bg-gray-100">
                            {car.imageUrl ? (
                                <Image
                                    src={car.imageUrl}
                                    alt={`${car.make} ${car.model}`}
                                    fill
                                    className="objct-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Images Available
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h2 className="text-xl font-semibold">
                                {car.year} {car.make} {car.model}
                            </h2>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                                ${car.price.toLocaleString()}
                            </p>

                            <Link
                                href={`/inventory/${car._id}`}
                                className="mt-4 block w-full text-center bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
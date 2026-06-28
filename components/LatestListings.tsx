"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

export default function LatestListings() {
    const latestCars = useQuery(api.cars.getLatestListings);

    // Handle loading state
    if (latestCars === undefined) {
        return (
            <div className="max-w-7xl mx-auto p-6 text-center text-gray-500 animate-pulse">
                Loading latest arrivals...
            </div>
        )
    }

    // Handle empty state if no listings are in the DB
    if (latestCars.length === 0) {
        return null; // Hide the section entirely
    }

    return (
        <section className="max-w-7xl mx-auto p-6 my-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <span className="text-yellow-600 font-semibold text-sm uppercase tracking-wider">
                        New Arrivals
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mt-1">
                        Latest Additions
                    </h2>
                </div>
                <Link 
                    href="/cars"
                    className="text-sm font-medium text-yellow-600 hover:underline hidden sm:block"
                >
                    View Full Inventory &rarr;
                </Link>
            </div>

            {/* 3-Column Display Grid*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestCars.map((car) => (
                    <div 
                        key={car._id}
                        className="group border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
                    >
                        {/* Image Box Container */}
                        <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
                            {car.imageUrl ? (
                                <Image
                                    src={car.imageUrl}
                                    alt={`${car.make} ${car.model}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition duration-300"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                    Photo Coming Soon
                                </div>
                            )}
                        </div>

                        {/* Car Data Information */}
                        <div className="p-5">
                            <span className="text-xs text-gray-400 font-medium">
                                {car.year}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 mt-0.5 truncate">
                                {car.make} {car.model}
                            </h3>
                            <p className="text-xl font-black text-green-600 mt-2">
                                ${car.price.toLocaleString()}
                            </p>    

                            <Link
                                href={`/cars/${car._id}`}
                                className="mt-4 block w-full text-center bg-yellow-600 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
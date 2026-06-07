"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

const BATCH_SIZE = 6;

export default function CarsPage() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.cars.getPaginatedCars,
        {},
        { initialNumItems: BATCH_SIZE }
    );

    const handleLoadMore = () => {
        if (status === "CanLoadMore") {
            loadMore(BATCH_SIZE);
        }
    };
    
    return (
        <main className="max-w-7xl mx-auto py-12 px-6">
            {/* Header Context */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-yellow-600 tracking-tight">
                    Explore Current Inventory
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Real-time availability directly from the showroom floor.
                </p>
            </div>

            {/* Main Grid Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((car) => (
                    <Link
                        href={`/cars/${car._id}`}
                        key={car._id}
                        className="group block bg-white border borger-gray-100 rounded-3xl 
                        overflow-hidden sahdow-sm transition-all duration-300"
                    >
                        {/* Visual Header Canvas */}
                        <div className="relative h-60 w-full bg-gray-50 overfow-hidden">
                            <Image 
                                src={car.imageUrl ?? "/assets/images/classified-placeholder.jpeg"}
                                alt={`${car.make} ${car.model}`}
                                fill
                                sizes="(max-w-7xl) 33vw, 100vw"
                                className="object-cover group-hover:scale-102 transition-transform
                                duration-500 ease-out"
                                unoptimized
                                priority={results.indexOf(car) < 3}
                            />

                            {/* Real-time Status Floating Badge */}
                            <div className="absolute top-4 right-4">
                                {car.isAvailable ? (
                                    <span className="bg-emerald-500/90 backdrop-blur-md text-white
                                    text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
                                    sahdow-sm">
                                        Available
                                    </span>
                                ) : (
                                    <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px]
                                    font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        On Hold
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            <span className="text-xs font-bold text-blue-600 uppercase
                            tracking-widest">
                                {car.year}
                            </span>
                            <h3 className="text-xl font-bold text-yellow-600 mt-1">
                                {car.make} <span className="font-medium text-gray-600">
                                    {car.model}
                                </span>
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Zero State Fallback */}
            {results.length === 0 && status === "Exhausted" && (
                <div className="text-center py-24 border border-dashed border-gray-200
                rounded-3xl bg-gray-50/50">
                    <p className="text-gray-500 font-medium">
                        No cars are listed in the inventory database right now.
                    </p>
                </div>
            )}
        
            {/* Controlled Pagination Footer Interactive Zone */}
            <div className="mt-16 flex flex-col items-center justify-center min-h-20">
                {status === "CanLoadMore" && (
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white
                        font-semibold rounded-2xl transition-all shadow-sm hover:shadow
                        active:scale-98 text-sm"
                    >
                        Load More Cars
                    </button>
                )}

                {status === "LoadingMore" && (
                    <div className="flex items-center gap-3 text-sm font-medium
                    text-gray-500">
                        {/* Subtle CSS Loading Ring */}
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600
                        rounded-full animate-spin" />
                        Querying serverless cluster...
                    </div>
                )}

                {status === "Exhausted" && results.length > 0 && (
                    <p className="text-xs font-medium text-gray-400 tracking-wide uppercase
                    bg-gray-50 px-4 py-2 rounded-full border broder-gray-100">
                        Showing all available listings.
                    </p>
                )}
            </div>
        </main>
    );
}
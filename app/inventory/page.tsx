"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function InventoryPage() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.cars.getPaginatedInventory,
        {},
        { initialNumItems: 6 }
    );

    // Initial loading state 
    // If results is empty and status is LoadingMore, the page is fetching its first batch.
    const isInitialLoading = results.length === 0 && status === "LoadingMore";
    
    return (
        <main className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl text-yellow-600 font-bold mb-8">
                Current Inventory
            </h1>

            {isInitialLoading ? (
                /* Render an elegant loading layout while the first batch loads */
                <div className="flex flex-col items-center justify-center py-24 flex-1">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600 mb-4"></div>
                    <p className="text-yellow-600 font-medium text-sm animate-pulse">
                        Loading current inventory...
                    </p>
                </div>
            ) : ( 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                    {results.map((car) => (
                        <div key={car._id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md flex flex-col">
                            {/* Image Container */}
                            <div className="relative h-48 w-full bg-gray-50">
                                {car.imageUrl ? (
                                    <Image
                                        src={car.imageUrl}
                                        alt={`${car.make} ${car.model}`}
                                        fill
                                        className="object-cover"
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
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    ${car.price.toLocaleString()}
                                </p>

                                <Link
                                    href={`/inventory/${car._id}`}
                                    className="mt-4 block w-full text-center bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-500 transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls Section (Only show if not initial loading) */}
            {!isInitialLoading && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t pt-6">
                {/* Batch Loading State: Shown when appending next pages */}
                {status === "LoadingMore" && (
                    <p className="text-sm text-gray-500 animate-pulse bg-gray-50 px-4 rounded-full border">
                        Loading more listings...
                    </p>
                )}

                {status === "CanLoadMore" && (
                    <button
                        onClick={() => loadMore(6)}
                        className="bg-white hover:bg-gray-50 text-yellow-600 border border-gray-300 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                    >
                        Load more listings.
                    </button>
                )}

                {status === "Exhausted" && results.length > 0 && (
                    <p className="text-xs text-gray-600 font-medium">
                        You have reached the end of the current inventory.
                    </p>
                )}

                {results.length === 0 && status === "Exhausted" && (
                    <p className="text-center py-20 text-gray-500">
                        No listings available at this time.
                    </p>
                )}
            </div>
            )}
        </main>
    )
}
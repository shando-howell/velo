"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function InventoryList() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.cars.getPaginatedCars,
        { searchTerm: ""},
        { initialNumItems: 10 }
    );

    if (status === "LoadingFirstPage") {
        return (
            <p className="text-gray-500 text-center animate-pulse">Loading inventory...</p>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-yellow-600 font-sans mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-600 tracking-wide">
                    Inventory Management
                </h2>
                <Link 
                    href="/admin/dashboard/add-listing" 
                    className="px-4 py-2 bg-green-600 text-white font-semibold tracking-wider
                    uppercase rounded hover:bg-green-400 transition-colors"
                >  
                    + Add Car
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-yellow-600 text-yellow-600 uppercase tracking-widest">
                            <th className="py-4 px-4 font-medium">Car</th>
                            <th className="py-4 px-4 font-medium">Year</th>
                            <th className="py-4 px-4 font-medium">Price</th>
                            <th className="py-4 px-4 font-medium">Status</th>
                            <th className="py-4 px-4 font-medium text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="text-yellow-600">
                        {results.map((car) => (
                            <tr
                                key={car._id}
                                className="border-b border-yellow-300/50 hover:bg-yellow-300/50 transition-colors"
                            >   
                                <td className="py-4 px-4">
                                    <div className="font-bold text-gray-800 text-base">
                                        {car.make} {car.model}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-800">{car.year}</td>
                                <td className="py-4 px-4 text-gray-800">${car.price.toLocaleString()}</td>
                                <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        car.status === "available" ? "bg-green-600/10 text-green-600 border border-green-600/20" :
                                        "bg-red-600/10 text-red-600 border border-red/20"
                                    }`}>
                                        {car.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Link
                                            href={`/admin/dashboard/cars/${car._id}/edit`}
                                            className="text-yellow-600 border border-yellow-600 bg-yellow-400/10 p-2 tracking-wider transition-colors"
                                        >
                                            Modify
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {results.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-yellow-600 italic">
                                    No cars foiund in inventory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-center items-center">
                {status === "CanLoadMore" && (
                    <button
                        onClick={() => loadMore(10)}
                        className="px-6 py-2 bg-yellow-600 text-white font-semibold tracking-wider
                        uppercase border border-yellow-600 rounded hover:bg-yellow-600 transition-colors"
                    >
                        Load More Cars
                    </button>
                )}

                {status === "LoadingMore" && (
                    <div className="px-6 py-2 text-yellow-600 font-semibold tracking-wider 
                    uppercase animate-pulse">
                        Loading...
                    </div>
                )}

                {status === "Exhausted" && results.length > 0 && (
                    <div className="px-6 py-2 text-yellow-600 tracking-wider uppercase">
                        End of Inventory
                    </div>
                )}
            </div>
        </div>
    );
}
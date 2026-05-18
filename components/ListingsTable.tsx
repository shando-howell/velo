"use client";

import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EyeIcon } from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ListingsTable() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.cars.getPaginatedListings,
        {},
        { initialNumItems: 8 }
    )

    // Initiial loading state
    const isInitialLoading = results.length === 0 && status === "LoadingMore";

    return (
        <div className="mt-5">
            {!results && (
                <h1 className="text-yellow-600 text-center py-20 font-bold text-3xl">
                    You have no listings.
                </h1>
            )}

            {isInitialLoading ? (
                <div className="flex flex-col items-center justify-center py-24 flex-1">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600 mb-4"></div>
                    <p className="text-yellow-600 font-medium text-sm animate-pulse">
                        Loading current inventory...
                    </p>
                </div>
            ) : ( 
            <Table className="mt-5">
                <TableHeader className="uppercase bg-yellow-600">
                    <TableRow >
                        <TableHead className="text-white">
                            Make
                        </TableHead>
                        <TableHead className="text-white">
                            Model
                        </TableHead>
                        <TableHead className="text-white">
                            Price
                        </TableHead>
                        <TableHead/>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map(car => {
                        return (
                            <TableRow key={car._id}>
                                <TableCell>{car.make}</TableCell>
                                <TableCell>{car.model}</TableCell>
                                <TableCell>{car.price}</TableCell>
                                <TableCell className="flex justify-end gap-1">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/inventory/${car._id}`}>
                                            <EyeIcon />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>)}

            {/* Pagination Controls Section */}
            {!isInitialLoading && (
                <div className="mt-0 flex flex-col items-center justify-center gap-4 border-t pt-6">
                    {status === "LoadingMore" && (
                        <p className="text-sm text-gray-500 animate-pulse bg-gray-50 px-4 rounded-full border">
                            Loading more listings...
                        </p>
                    )}

                    {status === "CanLoadMore" && (
                        <button
                            onClick={() => loadMore(8)}
                            className="bg-white hover:bg-gray-50 text-yellow-600 border border-gray-300 px-6 py-2.6 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            Loading more listings.
                        </button>
                    )}

                    {status === "Exhausted" && results.length > 0 && (
                        <p className="text-xs text-gray-600 font-medium">
                            You have reached the end of the listings.
                        </p>
                    )}

                    {results.length === 0 && status === "Exhausted" && (
                        <p className="text-center py-20 text-gray-500">
                            No listings available at this time.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
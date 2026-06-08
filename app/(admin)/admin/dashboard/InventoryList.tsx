"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

export default function InventoryList() {
    const cars = useQuery(api.cars.getAllCars);

    if (cars === undefined) {
        return (
            <div className="animate-pulse bg-gray-200 h-64 rouned-md">
                Loading cars...
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {cars.map((car) => (
                <div key={car._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                    {/* Image Container */}
                    <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center">
                        {car.imageUrl ? (
                            <Image
                                src={car.imageUrl}
                                alt={`${car.year} ${car.make} ${car.model}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-with: 1200px) 50vw, 33vw"
                                unoptimized
                            />
                        ) : (
                            <Image
                                src="./assets/images/classified-placeholder.jpeg"
                                alt={`${car.year} ${car.make} ${car.model}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-with: 1200px) 50vw, 33vw"
                            />
                        )}
                    </div>

                    {/* Car Details */}
                    <div className="p-4">
                        <h4 className="text-lg font-bold text-slate-900">
                            {car.year} {car.make} {car.model}
                        </h4>
                        <p className="text-green-600 font-semibold mt-1">
                            ${car.price.toLocaleString()}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="inline-flex items-center px-2.5 py-.05 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {car.status}
                            </span>
                            <Link href={`/admin/dashboard/cars/${car._id}/edit`} className="text-gray-500">
                                Edit Listing
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
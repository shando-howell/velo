"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import ManageListingButtons from "@/components/ManageListingButtons";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function CarDetailsPage() {
    const params = useParams();
    const carId = params.id as Id<"cars">;

    const car = useQuery(api.cars.getCarById, { id: carId });

    if (car === undefined) {
        return <LoadingSkeleton />
    }
    if (car === null) return <div className="p-10 text-center">Car not found.</div>;

    return (
        <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 mg:grid-cols-2 gap-12">
            {/* Left column: photo gallery */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                {car.imageUrl ? (
                    <Image
                        src={car.imageUrl}
                        alt={car.model}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        No Photo
                    </div>
                )}
            </div>

            {/* Right Column: Details and Booking */}
            <div className="flex flex-col gap-6">
                <div>
                    <span className="text-blue-600 font-semibold uppercase tracking-wide">
                        {car.year}
                    </span>
                    <h1 className="text-4xl font-bold mt-1">{car.make} {car.model}</h1>
                    <p className="text-3xl font-light text-gray-700 mt-4">
                        ${car.price.toLocaleString()}
                    </p>
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-2">Specifications</h3>
                    <ul className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <li className="bg-gray-50 p-3 rounded-lg">Condition: Certified Pre-Owned</li>
                        <li className="bg-gray-50 p-3 rounded-lg">Transmission: Automatic</li>
                    </ul>
                </div>

                <ManageListingButtons carId={car._id} initialData={car} />

                {/* This is where the scheduling component will go */}
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl font-bold transition">
                    Schedule a Test Drive
                </button>
            </div>
        </main>
    );
}
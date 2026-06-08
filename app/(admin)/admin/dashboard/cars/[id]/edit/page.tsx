"use client"

import { use } from "react";
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import EditCarRow from "../../../EditCarRow";

export default function CarEditPage({ params }: {params: Promise<{id: string}>}) {
    const unwrappedParams = use(params);
    const carId = unwrappedParams.id as Id<"cars">;

    // Fetch the specific car and the lits of all staff
    const car = useQuery(api.cars.getCarById, { id: carId });
    const staffMembers = useQuery(api.staff.getAllStaff);

    // Handle loading states while Convex fetches the data
    if (car === undefined || staffMembers === undefined) {
        return (
            <div className="p-8 text-center text-gray-500 animate-pulse">
                Loading car details...
            </div>
        );
    }

    // Edge case if car was deleted or ID is invalid
    if (car === null) {
        return (
            <div className="p-8 text-center text-gray-500">
                Car was not found.
            </div>
        )
    }

    const formattedStaff = staffMembers.map((staff) => ({
        id: staff._id,
        name: staff.name
    }));

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white shadow-sm
        rounded-lg border border-gray-100">
            <div className="mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Listing: {car.make} {car.model}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Listing ID: {car._id}
                </p>
            </div>

            <EditCarRow
                carId={car._id}
                currentPrice={car.price}
                currentStaffId={(car.assignedStaff || "") as Id<"salesStaff"> | ""}
                availableStaff={formattedStaff}
            />
        </div>
    );
}
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs";

interface ManageListingButtonsProps {
    carId: Id<"cars">,
    initialData: {
        make: string,
        model: string,
        year: number,
        price: number
    }
}

export default function ManageListingButtons({carId, initialData}: ManageListingButtonsProps) {
    const router = useRouter();
    const deleteListing = useMutation(api.cars.deleteCar);
    const updateListing = useMutation(api.cars.updateCar);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State for updating fields
    const [price, setPrice] = useState(initialData.price);

    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return null;
    }

    const isAdmin = user?.publicMetadata?.role === "admin";

    const handleDelete = async () => {
        const confirmed = confirm("Are you sure you want to permanently delete this listing?");
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await deleteListing({id: carId});
            router.push("/inventory");
        } catch (error) {
            console.error("Failed to delete listing.", error);
            setIsDeleting(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await updateListing({
                id: carId,
                make: initialData.make,
                model: initialData.model,
                year: initialData.year,
                price: price
            });
            setIsEditing(false);
            alert("Price updated successfully!");
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    return (
        <>
            {isAdmin && (
                
                <div className="border p-4 rounded-xl bg-gray-50 space-y-4">
                <h1 className="font-semibold text-lg">Manage Listing</h1>

                {isEditing ? (
                    <div className="space-y-2">
                        <label className="text-sm">New Price($)</label>
                        <input 
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="border p-2 w-full rounded"
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={handleUpdate} 
                                className="bg-green-500 text-white px-4 py-2 rounded text-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 px-4 py-2 rounded text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                        >
                            Edit Price
                        </button>

                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
                        >
                            {isDeleting ? "Deleting..." : "Delete Listing"}
                        </button>
                    </div>
                )}
            </div>
            )}
        </>
    )
}
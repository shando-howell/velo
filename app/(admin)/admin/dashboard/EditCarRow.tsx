"use client";

import { useState } from  "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EditCarProps {
    carId: Id<"cars">;
    currentPrice: number;
    currentSpecifications: string;
}

export default function EditCarRow({
    carId,
    currentPrice,
    currentSpecifications
}: EditCarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(currentPrice);
    const [specifications, setSpecifications] = useState(currentSpecifications);
    const [isSaving, setIsSaving] = useState(false);

    const updateCar = useMutation(api.cars.updateCar);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateCar({ 
                carId, 
                price, 
                specifications
            })
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update car", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="flex flex-col text-slate-700 gap-4 p-4 border-b">
                <p className="flex-1">Price: ${price.toLocaleString()}</p>
                <p className="flex-1">Specifications: {specifications}</p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-400 transition-colors"
                >
                    Edit
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 bg-white">
            <div className="flex-1">
                <label className="block text-gray-500 mb-1">Price ($)</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-slate-700"
                />
            </div>

            <div className="flex-1">
                <label className="block text-gray-500 mb-1">Specifications</label>
                <textarea
                    rows={8}
                    value={specifications}
                    onChange={(e) => setSpecifications((e.target.value))}
                    className="w-full border rounded px-2 py-1 text-slate-700"
                />
            </div>

            <div className="flex gap-2 mt-5">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-400
                    disabled:bg-blue300 transition-colors"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={() => {
                        setPrice(currentPrice);
                        setSpecifications(currentSpecifications);
                        setIsEditing(false);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}


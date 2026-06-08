"use client";

import { useState } from  "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EditCarProps {
    carId: Id<"cars">;
    currentPrice: number;
    currentStaffId: Id<"salesStaff"> | "";
    availableStaff: { id: string; name: string }[];
}

export default function EditCarRow({
    carId,
    currentPrice,
    currentStaffId,
    availableStaff
}: EditCarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(currentPrice);
    const [staffId, setStaffId] = useState(currentStaffId);
    const [isSaving, setIsSaving] = useState(false);

    const updateCar = useMutation(api.cars.updateCar);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateCar({ 
                carId, 
                price, 
                assignedStaffId: staffId === "" ? undefined : (staffId as Id<"salesStaff">)});
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update car", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="flex items-center text-slate-700 gap-4 p-4 border-b">
                <p className="flex-1">Price: ${price.toLocaleString()}</p>
                <p className="flex-1">Assigned To: {availableStaff.find(s => s.id === staffId)?.name || "Unassigned"}</p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                    Edit
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-4 p-4 border-b bg-blue-50">
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
                <label className="block text-gray-500 mb-1">Assign Staff</label>
                <select
                    value={staffId}
                    onChange={(e) => {
                        const newStaffId = e.target.value as Id<"salesStaff">;
                        setStaffId(newStaffId)
                    }}
                    className="w-full border rounded px-2 py-2 bg-white text-slate-700"
                >
                    <option value="">Unassigned</option>
                    {availableStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                            {staff.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2 mt-5">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
                    disabled:bg-blue300 transition-colors"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={() => {
                        setPrice(currentPrice);
                        setStaffId(currentStaffId);
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


"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { carFormSchema } from "@/lib/validations";
import { Id } from "@/convex/_generated/dataModel";

export default function AddCarForm() {
    const generateUploadUrl = useMutation(api.cars.generateUploadUrl);
    const staffMembers = useQuery(api.staff.getAllStaff);
    const addCar = useMutation(api.cars.addCar);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [salesStaffId, setSalesStaffId] = useState("");
    const [error, setError] = useState("");
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        // 1. Gather form data
        const formData = new FormData(e.currentTarget);
        const rawData = {
            make: formData.get("make"),
            model: formData.get("model"),
            year: formData.get("year"),
            price: formData.get("price"),
        };

        // 2. Validate with Zod
        const validation = carFormSchema.safeParse(rawData);
        if (!validation.success) {
            setError(validation.error.message);
            setIsSubmitting(false);
            return;
        }

        try {
            let imageId: Id<"_storage"> | undefined = undefined;

            // Handle image upload (if file was selected)
            if (selectedImage) {
                // 1. Get the secure URL from Convex
                const postUrl = await generateUploadUrl();

                // 2. POST the file directly to Convex storage
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: {"Content-Type": selectedImage.type},
                    body: selectedImage,
                });
                const { storageId } = await result.json();
                imageId = storageId;
            }
            // 3. Save the storageId to your "cars" table
            await addCar({
                ...validation.data,
                status: "available",
                imageId,
                assignedStaff: salesStaffId as Id<"salesStaff">
            });

            // Reset form
            (e.target as HTMLFormElement).reset();
            setSelectedImage(null);
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to add vehicle. Please try again.")
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <form 
                        onSubmit={handleSubmit} 
                        className="relative overflow-hidden shadow-2xl backdrop-blur-sm p-6 border-0 space-y-6 rounded-lg"
                    >
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <div className="text-center pb-6">
                            <h2 className="text-3xl font-bold text-gray-300">Add A New Listing</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-300">Make</label>
                                <input 
                                    name="make"
                                    type="text"
                                    required
                                    className="mt-1 w-full border rounded-md border-gray-300 shadow-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Model</label>
                                <input 
                                    name="model"
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 shadow-sm p-2 rounded-md"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Year</label>
                                <input
                                    name="year"
                                    type="number"
                                    className="mt-1 block w-full border p-2 rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Price ($)</label>
                                <input
                                    name="price"
                                    type="number"
                                    className="mt-1 block w-full border p-2 rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-300 font-medium">Car Photo</label>
                            <button className="hover:bg-blue-500 bg-blue-600 py-3 px-8 font-bold hover:shadow-xl shadow-lg rounded-lg uppercase">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    className="w-full mt-1"
                                    onChange = {(e) => setSelectedImage(e.target.files?.[0] || null)}
                                    hidden
                                />
                                <label htmlFor="imageUpload" className="text-gray-300">Upload Image</label>
                            </button>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="staff-select" className="mb-1 text-sm font-medium">
                                Assign Sales Staff
                            </label>
                            <select
                                id="staff-select"
                                value={salesStaffId}
                                onChange={(e) => setSalesStaffId(e.target.value)}
                                className="p-2 border rounded-md"
                                required
                            >
                                <option value="" disabled>Select a team member</option>
                                {staffMembers?.map((staff) => (
                                    <option key={staff._id} value={staff._id}>
                                        {staff.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-14 px-16 w-full hover:shadow-xl shadow-lg bg-green-600 hover:bg-green-500 text-gray-300 uppercase rounded-lg font-semibold disabled:bg-green-300 md:w-auto"
                            >
                                {isSubmitting ? "Adding..." : "Add Car to Lot"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
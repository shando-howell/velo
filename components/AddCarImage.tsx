"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function AddCarImage() {
    const router = useRouter();
    const generateUploadUrl = useMutation(api.cars.generateUploadUrl);
    const addCar = useMutation(api.cars.addCar);

    const [formData, setFormData] = useState({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        price: 0,
        isAvailable: true
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedImage) return alert("Please select an image");

        setIsSubmitting(true);

        try {
            // 1. Get the secure URL from Convex
            const postUrl = await generateUploadUrl();
    
            // 2. POST the file directly to Convex storage
            const result = await fetch(postUrl, {
                method: "POST",
                headers: {"Content-Type": selectedImage.type},
                body: selectedImage,
            });
    
            const { storageId } = await result.json();

            // 3. Save the storageId to your "cars" table
            await addCar({
                ...formData,
                imageId: storageId
            });
            
            router.push("/inventory"); // Redirect to listing page
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold">Add New Vehicle</h2>

            <div>
                <label className="block text-sm font-medium">Make</label>
                <input 
                    required
                    className="w-full border p-2 rounded"
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Model</label>
                <input 
                    required
                    className="w-full border p-2 rounded"
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium">Year</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        onChange={(e) => setFormData({...formData, year:Number(e.target.value)})}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium">Price ($)</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium">Vehicle Image</label>
                <input
                    type="file"
                    accept="image/*"
                    className="w-full mt-1"
                    onChange = {(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded-lg font-semibold disabled:bg-blue-300"
            >
                {isSubmitting ? "Submitting..." : "Add to Inventory"}
            </button>
        </form>
    );
}
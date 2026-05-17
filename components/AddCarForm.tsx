"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function AddCarForm() {
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
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="p-2">
                    <form 
                        onSubmit={handleSubmit} 
                        className="relative overflow-hidden shadow-2xl backdrop-blur-sm p-6 border-0  space-y-6 rounded-lg"
                    >
                        <div className="text-center pb-6">
                            <h2 className="text-3xl font-bold text-yellow-600">Add A New Listing</h2>
                        </div>
                        <div>
                            <label className="block font-medium">Make</label>
                            <input 
                                required
                                className="w-full border p-2 rounded"
                                onChange={(e) => setFormData({...formData, make: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Model</label>
                            <input 
                                required
                                className="w-full border p-2 rounded"
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block font-medium">Year</label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded"
                                    onChange={(e) => setFormData({...formData, year:Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block font-medium">Price ($)</label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded"
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-medium">Vehicle Image</label>
                            <button className="hover:bg-blue-500 bg-blue-600 py-3 px-8 font-bold hover:shadow-xl shadow-lg rounded-lg uppercase">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    className="w-full mt-1"
                                    onChange = {(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                                    hidden
                                />
                                <label htmlFor="imageUpload" className="text-white">Upload Image</label>
                            </button>
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData}
                                className="h-14 px-16 w-full hover:shadow-xl shadow-lg bg-green-600 hover:bg-green-500 text-white uppercase rounded-lg font-semibold disabled:bg-green-300 md:w-auto"
                            >
                                {isSubmitting ? "Submitting..." : "Add to Inventory"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
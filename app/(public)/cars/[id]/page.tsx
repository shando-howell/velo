import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import ManageListingButtons from "@/components/ManageListingButtons";
import BookingPanel from "@/components/BookingPanel";

interface CarPageProps {
    params: Promise<{ id: string }>
}

export default async function CarDetailsPage({ params } : CarPageProps) {
    const resolvedParams = await params;

    // 1. Cast the string ID from the URL parameter into a validated Convex ID
    const carId = resolvedParams.id as Id<"cars">;

    const car = await fetchQuery(api.cars.getCarById, { id: carId });

    if (car === undefined) {
        return (
            <div className="max-w-7xl mx-auto p-6 text-center text-gray-500 animate-pulse">
                Loading car details...
            </div>
        )
    }
    if (car === null) return <div className="p-10 text-center">Car not found.</div>;

    // Grab the first available sales staff member
    const staffList = await fetchQuery(api.cars.getSalesStaff);
    const primaryRepresentative = staffList[0];

    // Mocking a unique user session string
    const currentUserId = "buyer-session-beta";

    return (
        <main className="max-w-6xl mx-auto py-12 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left column: photo gallery */}
            <div className="lg:col-span-2">
                <div className="relative h-96 w-full rounded-2xl overflow-hidden mb-6 shadow-sm">
                    <Image
                        src={car.imageUrl ?? "/assets/images/classified-placeholder.png"}
                        alt={car.model}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <h1 className="text-4xl text-yellow-600 font-bold mt-1">{car.make} {car.model}</h1>
                <div className="border-t pt-6 py-4">
                    <span className="text-gray-700 font-semibold uppercase tracking-wide">
                        {car.year}
                    </span>
                    
                    <p className="text-3xl font-light text-gray-700 py-2">
                        ${car.price.toLocaleString()}
                    </p>
                    <h3 className="text-lg font-medium mb-2">Specifications</h3>
                    <ul className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <li className="bg-gray-50 p-3 rounded-lg">Condition: Certified Pre-Owned</li>
                        <li className="bg-gray-50 p-3 rounded-lg">Transmission: Automatic</li>
                    </ul>
                </div>

                
                {/* TO DO: Add admin auth check for manage listing buttons */}
                <ManageListingButtons carId={car._id} initialData={car} />
            </div>

            {/* Right Column: Transactional Sidebar */}
            <div className="space-y-6">
                {primaryRepresentative && (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Assigned Consultant
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                            {primaryRepresentative.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {primaryRepresentative.expertise}
                        </p>
                    </div>
                )}
                {/* Booking Panel Island */}
                <BookingPanel
                    carId={carId}
                    salesStaffId={primaryRepresentative?._id}
                    userId={currentUserId as Id<"users">}
                />
            </div>
            </div>
        </main>
    );
}
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import ManageListingButtons from "@/components/ManageListingButtons";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import BookingPanel from "@/components/BookingPanel";
import BookingWidget from "@/components/BookingWidget";

interface CarPageProps {
    params: Promise<{ id: string }>
}

export default async function CarDetailsPage({ params } : CarPageProps) {
    const resolvedParams = await params;

    // 1. Cast the string ID from the URL parameter into a validated Convex ID
    const carId = resolvedParams.id as Id<"cars">;

    const car = await fetchQuery(api.cars.getCarById, { id: carId });

    if (car === undefined) {
        return <LoadingSkeleton />
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
                        src={car.imageUrl}
                        alt={car.model}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <h1 className="text-4xl font-bold mt-1">{car.make} {car.model}</h1>

                {/* Status Badge driven by the server-evaluated OCC lease boolean */}
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rouned-full text-xs font-bold uppercase tracking-wider mb-8">
                    {car.isAvailable ? (
                        <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">Available</span>
                    ) : (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">Temporarily Reserved</span>
                    )}
                </div> */}

                {/* Booking Widget Island */}
                <BookingWidget carId={car._id} />
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
                    userId={currentUserId}
                />

                <div className="border-t pt-6">
                    <span className="text-blue-600 font-semibold uppercase tracking-wide">
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
            </div>
        </main>
    );
}
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface BookingPanelProps {
    carId: Id<"cars">;
    salesStaffId: Id<"salesStaff">;
    userId: string; 
}

export default function BookingPanel({ carId, salesStaffId, userId }: BookingPanelProps) {
    const car = useQuery(api.cars.getCarById, {id: carId});
    const acquireLease = useMutation(api.bookings.acquireLease);

    // UI State Management
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [leaseExpiry, setLeaseExpiry] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");

    // Countdown timer loop that executes if a lease is successfully claimed
    useEffect(() => {
        if (!leaseExpiry) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const difference = leaseExpiry - now;

            if (difference <= 0) {
                setLeaseExpiry(null);
                setTimeLeft("");
                clearInterval(interval);
                setErrorMessage("Your temporary hold has expired. The vehicle has been released.");
            } else {
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [leaseExpiry]);

    const handleBookingAttempt = async () => {
        setIsPending(true);
        setErrorMessage(null);

        try {
            // Exectute the atomic mutation on the server
            const result = await acquireLease({
                carId,
                staffId: salesStaffId,
                userId,
            });

            if (result.success && result.leaseExpiresAt) {
                // Guard passed! Lock secured successfully.
                setLeaseExpiry(result.leaseExpiresAt)
            } else {
                // Guard failed! Convex returned an intentional OCC failure reason.
                setErrorMessage(result.reason || "This car has just been reserved by another user.");
            }
        } catch (error) {
            setErrorMessage("Database transactional layer rejected the request.")
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="p-6 bg-white border border-gray-200 rouned-2xl shadow-sm max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Your Test Drive</h3>
            <p className="text-sm text-gray-500 mb-6">
                Clicking below places a strict 10-minute hold on this car and your selected
                representative.
            </p>

            <div className="mb-4">
                {car?.isAvailable ? (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 
                    rounded-full uppercase tracking-wider">
                        Available
                    </span>
                ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1
                    rounded-full uppercase tracking-wider">
                        Temporarily Reserved
                    </span>
                )}
            </div>

            {/* Case 1: Lease is Active */}
            {leaseExpiry ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-sm font-semibold text-green-800 mb-1">
                        Hold Secured Successfully!
                    </p>
                    <p className="text-s text-green-600 mb-3">
                        Confirm your booking before the lease expires.
                    </p>
                    <div className="inline-block text-2xl font-mono font-bold text-green-700 bg-white px-4 py-1.5 rounded-lg border border-green-100 shadow-sm">
                        {timeLeft || "10:00"}
                    </div>
                </div>
            ) : (
                /* Case 2: Standard/Initial State */
                <button
                    onClick={handleBookingAttempt}
                    disabled={isPending || !car?.isAvailable}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white 
                    font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 
                    disabled:cursor-not-allowed"
                >
                    {isPending ? "Evaluating Database Leases..." : "Reserve Car & Staff"}
                </button>
            )}

            {/* Error Messaging Output */}
            {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700">
                    {errorMessage}
                </div>
            )}
        </div>
    );
}
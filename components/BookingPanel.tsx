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
    const finalizeBooking = useMutation(api.bookings.finalizeBooking);

    // UI & Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        testDriveDate: "",
        driversLicense: ""
    });

    // Database State
    const [isPending, setIsPending] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
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

    if (!car) {
        return (
            <div className="p-4 text-gray-500 animate-pulse">
                Loading availability...
            </div>
        )
    }

    // 1. Secure the lock first
    const handleInitialLock = async () => {
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
                setIsFormVisible(true); // Open the form ONLY after lock is secured
            } else {
                setErrorMessage(result.reason || "This car has been reserved by another user.");
            }
        } catch (error) {
            setErrorMessage("Database transactional layer rejected the request.")
        } finally {
            setIsPending(false);
        }
    };

    // 2. Handle the actual form inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 3. Finalize the entire appointment
    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsFinalizing(true);
        setErrorMessage(null);

        try {
            const result = await finalizeBooking({
                carId,
                userId,
                fullName: formData.fullName,
                email: formData.email,
                testDriveDate: formData.testDriveDate,
                driversLicense: formData.driversLicense,
            });

            if (result.success) {
                setIsSuccess(true);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to finalize booking.")
        } finally {
            setIsFinalizing(false);
        }
    };

    // View 1: The Collapsed Initial State
    if (!isFormVisible) {
        return (
            <div className="p-6 bg-white border border-gray-200 rouned-2xl shadow-sm max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        Interested?
                    </h3>
                    {car?.isAvailable ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 
                        rounded-full uppercase tracking-wider">
                            Available
                        </span>
                    ) : (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1
                        rounded-full uppercase tracking-wider">
                            On Hold
                        </span>
                    )}
                </div>
                
                <button
                    onClick={handleInitialLock}
                    disabled={isPending || !car?.isAvailable}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white 
                    font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 
                    disabled:cursor-not-allowed"
                >
                    {isPending 
                        ? "Securing Hold..." 
                        : car?.isAvailable 
                        ? "Hold Car & Book Drive"
                        : "Currently Unavailable"
                    }
                </button>

                {/* Error Messaging Output */}
                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700">
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }

    // View 2: The Success Screen 
    if (isSuccess) {
        return (
            <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm 
            max-w-md text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex
                items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
                    ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mn-2">You&apos;re All Set!</h3>
                <p className="text-sm text-gray-600 mb-6">
                    We have secured this {car?.make} {car?.model} for you.
                    A confirmation email will be sent to: <span className="font-semibold text-gray-800">{formData.email}</span>.
                </p>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-left mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Appointment Details
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        {new Date(formData.testDriveDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                        Please bring your driver&apos;s license.
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = "/cars"}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white 
                    font-semibold rounded-xl transition-colors shadow-sm"
                >
                    Return to Inventory
                </button>
            </div>
        )
    }

    // View 3: The Expanded Secure Booking Form
    return (
        <div className="p-6 bg-white border bordger-gray-200 rounded-2xl shadow-sm max-w-md
        animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Timer Header */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center mb-6">
                <p className="text-sm font-semibold text-green-800 mb-1">Hold Secured!</p>
                <p className="text-xs text-green-700 mb-3">
                    Please complete your details before the timer expires.
                </p>
                <div className="inline-block text-2xl font-mono font-bold text-green-700
                bg-white px-4 py-1.5 rounded-lg border border-green-100 shadow-sm">
                    {timeLeft}
                </div>
            </div>

            {/* The Actual Form */}
            <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                        transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                        transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="testDriveDate"
                        required
                        value={formData.testDriveDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                        transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver&apos;s License Number
                    </label>
                    <input
                        type="text"
                        name="driversLicense"
                        required
                        value={formData.driversLicense}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                        transition-all"
                    />

                    <button
                        type="submit"
                        disabled={isFinalizing}
                        className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                        font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isFinalizing ? "Processing..." : "Confirm Appointment"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsFormVisible(false)}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 mt-3"
                    >
                        Cancel Appointment
                    </button>
                </div>
            </form>
        </div>
    )
}
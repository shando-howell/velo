"use client"

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function ScheduleTestDrive({ carId }: { carId: Id<"cars"> }) {
    const lockTimeSlot = useMutation(api.bookings.lockTimeSlot);
    const confirmBooking = useMutation(api.bookings.confirmBooking);

    // UI State
    const [step, setStep] = useState<"select-time" | "checkout" | "success">("select-time");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    const timerRef = useRef<HTMLSpanElement>(null);

    // Form and Lock State
    const [bookingId, setBookingId] = useState<Id<"bookings"> | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({ fullName: "", email: "", driversLicense: "" });

    // Fetch slots from Convex based on the currently selected date
    const availableSlots = useQuery(api.bookings.getAvailableSlots, {
        carId,
        date: selectedDate,
    });

    // Handle the countdown timer visually
    useEffect(() => {
        if (step !== "checkout" || !expiresAtMs) return;

        const timer = setInterval(() => {
            const secondsRemaining = Math.floor((expiresAtMs - Date.now()) / 1000);

            if (secondsRemaining <= 0) {
                clearInterval(timer);
                setErrorMessage("Your reservation window expired. Please select a new time.");
                setStep("select-time");
                setSelectedTime(null);
            } else if (timerRef.current) {
                const m = Math.floor(secondsRemaining / 60).toString().padStart(2, "0");
                const s = (secondsRemaining % 60).toString().padStart(2, "0");
                timerRef.current.innerText=`${m}:${s}`;
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [step, expiresAtMs]);

    const handleLockSlot = async () => {
        if (!selectedTime) return;
        setErrorMessage(null);

        // Calculate end time (assuming 60 minute blocks based on backend)
        const [hour, min] = selectedTime.split(":").map(Number);
        const endHour = hour + 1;
        const endTime = `${String(endHour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

        try {
            const { bookingId: newBookingId, expiresAt } = await lockTimeSlot({
                carId,
                date: selectedDate,
                startTime: selectedTime,
                endTime
            });

            setBookingId(newBookingId);
            setExpiresAtMs(expiresAt);
            setStep("checkout");
        } catch (error) {
            console.error("That slot was just taken! Please select another.");
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId) return;

        try {
            await confirmBooking({
                bookingId, 
                fullName: formData.fullName,
                email: formData.email,
                driversLicense: formData.driversLicense
            });
            
            // Move to the final success screen
            setStep("success");
        } catch (error) {
            alert(error);
            setStep("select-time");
        }
    };

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm max-w-md transition-all duration-300">
            {step === "select-time" && (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <h2 className="text-xl font-bold text-gray-900">Schedule A Test Drive</h2>

                    {/* 4. Render the error banner beautifully above the calendar */}
                    {errorMessage && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200 flex items-center gap-2">
                            {errorMessage}
                        </div>
                    )}

                    {/* Calendar Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Date
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Timeslot Grid */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Available Times</label>
                        {availableSlots === undefined ? (
                            <div className="animate-pulse bg-gray-100 h-24 rounded-lg"></div>
                        ) : availableSlots.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No slots available for this date.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={
                                            `py-2 rounded-lg text-sm font-medium transition-colors
                                            ${selectedTime === time
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-50 border hover:bg-gray-100 text-gray-700"
                                            }`
                                        }
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLockSlot}
                        disabled={!selectedTime}
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        Lock Slot
                    </button>
                </div>
            )} 
                
            {step === "checkout" && (
                <form onSubmit={handleConfirm} className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                    <div className="flex justify-between items-center bg-red-50 p-3 rounded">
                        <span className="font-semibold text-red-600">Complete booking in:</span>
                        <span 
                            ref={timerRef}
                            className="font-mono text-lg font-bold text-red-600"
                        >
                            10:00
                        </span>
                    </div>

                    <input 
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full p-2 border rounded"
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />

                    <input 
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full p-2 border rounded"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <input 
                        type="text"
                        placeholder="Driver's License Number"
                        required
                        className="w-full p-2 border rounded"
                        onChange={(e) => setFormData({ ...formData, driversLicense: e.target.value })}
                    />

                    <button 
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded font-bold"
                    >
                        Confirm Booking
                    </button>
                </form>
            )}

            {step === "success" && (
                <div className="text-center space-y-4 py-8 animate-in zoom-in fade-in">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full 
                    flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
                    <p className="text-gray-600">
                        Your test drive is locked in. We sent a confirmation email to the provided email address.
                    </p>
                    <button
                        onClick={() => {
                            setStep("select-time");
                            setSelectedTime(null);
                        }}
                        className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                        Book another drive
                    </button>
                </div>
            )}
        </div>
    );
}
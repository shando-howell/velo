"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// The standard operating hours for the dealership
const TIME_SLOTS = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM"
];

export default function BookingWidget({ carId }: { carId: Id<"cars">}) {
    const bookAppointment = useMutation(api.appointments.bookAppointment);

    const [customerName, setCustomerName] = useState("");
    const [selectedDate, setSelectedDate] = useState(""); // Stores "YYYY-MM-DD"
    const [selectedTime, setSelectedTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Fetch occupied slots reactivley based on chosen car and date
    const occupiedSlots = useQuery(
        api.appointments.getOccupiedSlots, 
        selectedDate ? { carId, dateStr: selectedDate } : "skip"
    );

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime || !customerName) {
            return alert("Please fill out all fields.")
        }

        setIsSubmitting(true);

        try {
            await bookAppointment({
                carId,
                customerName,
                dateString: selectedDate,
                timeSlot: selectedTime,
            });
            alert("Test drive requested! We will contact you shortly.")

            // Reset form
            setCustomerName("");
            setSelectedTime("");
        } catch (error) {
            alert(error instanceof Error ? error.message : "Something went wrong.")
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get tomorrow's date string to restrict past bookings in the HTML input
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDateStr = tomorrow.toISOString().split("T")[0];

    return (
        <form 
            onSubmit={handleBooking}
            className="border p-6 rounded-xl bg-white shadow-sm space-y-4"
        >
            <h2 className="text-xl font-bold">Book a Test Drive</h2>

            {/* Customer Name Input */}
            <div>
                <label className="block text-base font-medium mb-1">Your Name</label>
                <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border p-2 rounded-lg text-base"
                    placeholder="Enter your name"
                />
            </div>

            {/* Date Picker Input */}
            <div>
                <label className="block font-medium mb-1">Select Date</label>
                <input
                    type="date"
                    required
                    min={minDateStr}
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime(""); //Reset time if date changes
                    }}
                    className="w-full border p-2 rounded"
                />
            </div>

            {/* Time Slot Slection Grid */}
            {selectedDate && (
                <div>
                    <label className="block font-medium mb-2">Available Times</label>
                    {occupiedSlots === undefined ? (
                        <p className="text-xs text-gray-400">Loadinging slots...</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((slot) => {
                                const isBooked = occupiedSlots.includes(slot);
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={() => setSelectedTime(slot)}
                                        className={`p-2 font-semibold rounded-lg border transition ${isBooked
                                            ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                                            : selectedTime === slot
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 hover:border-gray-400"
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition disabled:bg-gray-300"

            >
                {isSubmitting ? "Booking..." : "Confirm Request"}
            </button>
        </form>
    )
}
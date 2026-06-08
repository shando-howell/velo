"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function LiveBookingFeed() {
    const bookings = useQuery(api.bookings.getRecentBookings);

    return (
        <div className="min-h-screen bg-white rounded-lg shadow-md border border-gray-100 overfow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">Live Booking Feed</h3>
                <span className="flex items-center text-sm font-medium text-green-600">
                    <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Real-Time
                </span>
            </div>

            {/* Loading State */}
            {bookings === undefined ? (
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-4">
                            <div className="h-12 bg-gray-100 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <ul className="divide-y divide-gray-100 max-h-125 overflow-y-auto">
                    {bookings.length === 0 ? (
                        <li className="p-6 text-center text-gray-500">No test drives scheduled.</li>
                    ) : (
                        bookings.map((booking) => (
                            <li key={booking._id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-900">{booking.customerName}</p>
                                        <p className="text-sm text-gray-500 mt-1">{booking.customerEmail}</p>
                                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full
                                        text-xs font-medium bg-blue-100 text-blue-800">
                                            {booking.car}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900">
                                            {new Date(booking.testDriveDate).toLocaleDateString(undefined, {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                        <p className={`mt-2 text-xs font-semibold uppercase ${
                                            booking.status === 'confirmed' ? 'text-green-600' : 'text-amber-500'
                                        }`}>
                                            {booking.status}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
"use client"

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from  "@/convex/_generated/dataModel";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function AppointmentsPanel() {
    const appointments = useQuery(api.appointments.getAllAppointments);
    const updateStatus = useMutation(api.appointments.updateAppointmentStatus);

    if (appointments === undefined) {
        return <LoadingSkeleton/>
    }

    const handleStatusChange = async (
        id: Id<"appointments">, 
        newStatus: "confirmed" | "cancelled"
    ) => {
        try {
            await updateStatus({ id, status: newStatus });
        } catch (error) {
            console.error(error instanceof Error ? error.message : "Failed to update status.")
        }
    };

    return (
        <main className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Appointments Panel</h1>
                <p className="text-gray-500 mt-1">Manage requested test drives and check inventory timelines.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 font-semibold uppercase text-gray-500 tracking-wider">
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4">Date and Time</th>
                            <th className="p-4">Status </th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No appointments scheduled yet.
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appointment) => (
                                <tr key={appointment._id} className="hover:bg-gray-50/70 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{appointment.customerName}</td>
                                    <td className="p-4 text-gray-600">{appointment.carDetails}</td>
                                    <td className="p-4 text-gray-600">
                                        <div className="font-medium">{appointment.dateString}</div>
                                        <div className="text-gray-400">{appointment.timeSlot}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium border ${
                                            appointment.status === "confirmed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : appointment.status === "cancelled"
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {appointment.status === "pending" && (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusChange(appointment._id, "confirmed")}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                                                >
                                                        Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(appointment._id, "cancelled")}
                                                    className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {appointment.status !== "pending" && (
                                            <span className="text-gray-400 italic">
                                                No actions available
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
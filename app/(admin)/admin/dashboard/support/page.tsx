"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminTicketsTable() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.support.getPaginatedTickets,
        {},
        { initialNumItems: 10 }
    );

    const updateStatus = useMutation(api.support.updateTicketStatus);

    const handleStatusChange = async (
        ticketId: Id<"supportTickets">,
        newStatus: "open" | "in-progress" | "resolved"
    ) => {
        try {
            // Optimistic UI update
            await updateStatus({ ticketId, status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update ticket status.");
        }
    };

    if (status === "LoadingFirstPage") {
        return <div className="p-8 text-gray-900 animate-pulse text-center">Loading support tickets...</div>
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-yellow-600 font-sans">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-yellow-600 tracking-wide">Concierge Desk</h2>
                <p className="text-gray-900 text-sm mt-1">Manage incoming client requests and bespoke inquries.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-yellow-600 text-white text-xs uppercase tracking-widest">
                            <th className="py-4 px-4 font-medium">Date</th>
                            <th className="py-4 px-4 font-medium">Client Email</th>
                            <th className="py-4 px-4 font-medium">Department</th>
                            <th className="py-4 px-4 font-medium">Message</th>
                            <th className="py-4 px-4 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-white">
                        {results.map((ticket) => (
                            <tr
                                key={ticket._id}
                                className="border-b border-yellow-400/50 hover:bg-yellow-400/50 transition-colors"
                            >
                                {/* Date created (using Convex's built-in timestamp) */}
                                <td className="py-4 px-4 whitespace-nowrap text-gray-900">
                                    {new Date(ticket._creationTime).toLocaleDateString()}
                                </td>

                                <td className="py-4 px-4 font-medium text-gray-900">
                                    {ticket.clientEmail}
                                </td>

                                <td className="py-4 px-4">
                                    <span className="uppercase tracking-wider text-[10px] text-gray-900
                                    border border-yellow-600 px-2 py-1 rounded">
                                        {ticket.department}
                                    </span>
                                </td>

                                {/* Truncated message for the table view */}
                                <td className="py-4 px-4 max-w-xs truncate text-gray-900" title={ticket.message}>
                                    {ticket.message}
                                </td>

                                {/* Inline Status Dropdown */}
                                <td className="py-4 px-4 text-right">
                                    <select
                                        value={ticket.status}
                                        // eslint-disable-next-line
                                        onChange={(e) => handleStatusChange(ticket._id, e.target.value as any)}
                                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                                            ticket.status === "open" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            ticket.status === "in-progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            "bg-green-500/10 text-green-500 border-green-500/20"
                                        }`}
                                    >
                                        <option value="open" className="bg-yellow-500 text-red-600">Open</option>
                                        <option value="in-progress" className="bg-yellow-500 text-blue-600">In Progress</option>
                                        <option value="resolved" className="bg-yellow-500 text-green-600">Resolved</option>
                                    </select>
                                </td>
                            </tr>
                        ))}

                        {results.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-900 italic">
                                    No open tickets at this time.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {/* <div className */}
        </div>
    )
}
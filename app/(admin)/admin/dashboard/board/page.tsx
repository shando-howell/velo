"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import { useState, useMemo } from "react";

import BoardColumn from "./BoardColumn";
import ActiveCard from "./ActiveCard";
import PendingCard from "./PendingCard";

export default function AdminBoard() {
    const bookings = useQuery(api.admin.getBoardBookings);
    const forceVerify = useMutation(api.admin.forceVerifyBooking);

    // Loading state
    if (bookings === undefined) return <div>Loading board...</div>;

    // Separate the data - unverified leads stay out of the drag-and-drop context
    const pendingBookings = bookings.filter((b) => b.status === "pending");

    // Confirmed bookings are part of the active workflow
    const activeBookings = bookings.filter((b) => b.status === "confirmed");

    const columns = {
        actionNeeded: activeBookings,
        carPrepared: [], // To filter by stage
        completed: [], // To filter by stage
    };

    // Handle the drag and drop event
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        // To add logic to update the booking's workflow stage
        console.log(`Dragged booking ${active.id} over to column ${over.id}`);
    };

    return (
        <div className="flex h-screen bg-gray-100 p-6 overflow-x-auto gap-6">

            {/* Column 1: The "Inbox" (Read-Only) */}
            <div className="w-70 shrink-0 bg-white rounded-lg shadow p-4 flex flex-col">
                <h2 className="font-bold text-lg mb-4 text-gray-700">
                    Awaiting Verification ({pendingBookings.length})
                </h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {pendingBookings.map((booking) => (
                        <PendingCard
                            key={booking._id}
                            booking={booking}
                            onForceVerify={() => forceVerify({ bookingId: booking._id })}
                        />
                    ))}
                    {pendingBookings.length === 0 && (
                        <p className="text-sm text-gray-400 text-center mt-10">
                            No pending leads.
                        </p>
                    )}
                </div>
            </div>

            {/* Columns 2+: Active Workflow (Wrapped in DndContext) */}
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <BoardColumn title="Action Needed" id="actionNeeded" items={columns.actionNeeded} />
                <BoardColumn title="Car Prepped" id="carPrepped" items={columns.carPrepared} />
                <BoardColumn title="Completed" id="completed" items={columns.completed} />
            </DndContext>
        </div>
    )
}
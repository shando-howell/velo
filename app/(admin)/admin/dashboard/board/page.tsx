"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import { Id } from "@/convex/_generated/dataModel";
import { WorkflowStage, VALID_STAGES } from "@/lib/types"

import BoardColumn from "./BoardColumn";
import PendingCard from "./PendingCard";

export default function AdminBoard() {
    const bookings = useQuery(api.admin.getBoardBookings);
    const forceVerify = useMutation(api.admin.forceVerifyBooking);
    const updateStage = useMutation(api.bookings.updateBookingStage);

    // Loading state
    if (bookings === undefined) return <div>Loading board...</div>;

    // Separate the data - unverified leads stay out of the drag-and-drop context
    const pendingBookings = bookings.filter((b) => b.status === "pending");

    // Confirmed bookings are part of the active workflow
    const activeBookings = bookings.filter((b) => b.status === "confirmed");

    const columns = {
        actionNeeded: activeBookings.filter((b) => b.stage === "actionNeeded" || !b.stage),
        carPrepared: activeBookings.filter((b) => b.stage === "carPrepped"),
        completed: activeBookings.filter((b) => b.stage === "completed"),
    };

    // Handle the drag and drop event
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const bookingId = active.id as Id<"bookings">;

        const droppedZoneId = String(over.id);

        if (!VALID_STAGES.includes(droppedZoneId as WorkflowStage)) {
            console.warn(`Dropped in an invalid zone: ${droppedZoneId}`);
            return;
        }

        const newStage = droppedZoneId as WorkflowStage;

        // Prevent unnecessary database writes if dropped in the same column
        const currentBooking = activeBookings.find(b => b._id === bookingId);
        if (currentBooking?.stage === newStage) return;

        updateStage({ bookingId, newStage }).catch((err) => {
            console.error("Failed to update stage:", err)
        });
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
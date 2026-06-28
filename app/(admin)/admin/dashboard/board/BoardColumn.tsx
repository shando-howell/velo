import { useDroppable } from "@dnd-kit/core";
import ActiveCard from "./ActiveCard";
import { BoardBooking } from "@/lib/types";

interface BoardColumnProps {
    id: string;
    title: string;
    items: BoardBooking[];
}

export default function BoardColumns({ id, title, items }: BoardColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: id });

    return (
        <div className="w-80 shrink-0 flex flex-col bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-100 rounded-t-lg">
                <h3 className="font-semibold text-gray-700 flex justify-between">
                    {title}
                </h3>
                <span className="text-sm font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm">
                    {items.length}
                </span>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
                    isOver ? "bg-blue-50/50" : ""
                }`}
            >
                {items.map((booking) => (
                    <ActiveCard key={booking._id} booking={booking} />
                ))}

                {items.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm
                    italic border-2 border-dashed border-gray-200 rounded-md p-4">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
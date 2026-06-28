import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BoardBooking } from "@/lib/types";

interface ActiveCardProps {
    booking: BoardBooking;
}

export default function ActiveCard({ booking }: ActiveCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: booking._id,
        data: {
            status: booking.status
        }
    });

    // Apply the physical movement to the card
    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-white p-4 rounded-md shadow border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-shadow ${
                isDragging ? "opacity-50 shadow-lg z-50 ring-2 ring-blue-500" : ""
            }`}
        >
            {/* Car Info / Image Placeholder */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                {booking.carDetails?.imageUrl ? (
                    <img 
                        src={booking.carDetails.imageUrl}
                        alt="Car thumbnail"
                        className="w-12 h-12 rounded object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                )}
                <div>
                    <p className="font-semibold text-sm">
                        {booking.carDetails?.year} {booking.carDetails?.make} {booking.carDetails?.model}
                    </p>
                    <p className="text-xs text-gray-500">{booking.startTime}</p>
                </div>
            </div>

            {/* Driver Details */}
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">{booking.fullName}</p>
                <p className="text-xs text-gray-600">{booking.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 uppercase tracking-wide">
                    <span>Lic:</span>
                    <span className="font-mono">{booking.driversLicense}</span>
                </div>
            </div>
        </div>
    );
}
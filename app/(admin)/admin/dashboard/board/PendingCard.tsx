import { BoardBooking } from "@/lib/types";

interface PendingCardProps {
    booking: BoardBooking;
    onForceVerify: () => void;
}

export default function PendingCard({ booking, onForceVerify }: PendingCardProps) {
    return (
        <div className="bg-white p-4 rounded-md shadow-sm border border-dashed border-gray-300 relative transition-all hover:shadow-md">

            {/* Pending Status Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                    Awaiting Email
                </span>
                <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>

                    {/* Car Info / Image Pipeline */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100 mt-4">
                        {booking.carDetails?.imageUrl ? (
                            <img
                                src={booking.carDetails.imageUrl}
                                alt="Car thumbnail"
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse border border-gray-200" />
                        )}
                        <div>
                            <p className="font-medium text-sm text-gray-800">
                                {booking.carDetails?.year} {booking.carDetails?.make} {booking.carDetails?.model}
                            </p>

                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {booking.startTime}
                            </p>
                        </div>
                    </div>

                    {/* Driver Details */}
                    <div className="space-y-1 mb-4">
                        <p className="text-sm font-semibold text-gray-800">{booking.fullName}</p>
                        <p className="text-xs text-gray-500">{booking.email}</p>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                            <span>Lic: {booking.driversLicense}</span>
                        </div>
                    </div>

                    {/* Manual Override Action */}
                    <div className="pt-2">
                        <button
                            onClick={onForceVerify}
                            className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded
                            text-xs font-semibold transition-colors flex justify-center iems-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Force Verify    
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
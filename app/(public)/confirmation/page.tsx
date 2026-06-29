"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ConfirmBookingPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const verifyBooking = useMutation(api.bookings.verifyBooking);

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleConfirm = async () => {
        if (!token) return;

        setStatus("loading");
        try {
            const result = await verifyBooking({ token });
            setStatus("success");
            setMessage(result.message);
        } catch (error) {
            setStatus("error");
            setMessage("There was an issue verifying your booking. The link may be invalid.");
        }
    };

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">Invalid link: Missing confirmation token.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Confirm Your Test Drive</h1>

                {status === "idle" && (
                    <>
                        <p className="text-gray-600 mb-6">
                            You are one step away! Click below to confirm your booking.
                        </p>
                        <button
                            onClick={handleConfirm}
                            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors w-full"
                        >
                            Verify Booking
                        </button>
                    </>
                )}

                {status === "loading" && <p className="text-gray-600">Verifying...</p>}

                {status === "success" && (
                    <div className="space-y-4">
                        <p className="text-green-600 font-medium">{message}</p>
                        <Link href="/" className="inline-block text-blue-600 hover:underline">
                            Return to Homepage
                        </Link>
                    </div>
                )}

                {status === "error" && <p className="text-red-500">{message}</p>}
            </div>
        </div>
    );
}
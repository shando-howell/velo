import { Doc } from "@/convex/_generated/dataModel";

export interface BoardBooking extends Doc<"bookings"> {
    carDetails: {
        make: string;
        model: string;
        year: number;
        imageUrl: string | null;
    } | null;
}
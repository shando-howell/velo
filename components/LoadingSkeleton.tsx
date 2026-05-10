import { Skeleton } from "@/components/ui/skeleton";
import { Car } from "lucide-react";

const LoadingSkeleton = () => {
    return (
        <>
            <Skeleton className="fixed top-1/2 left-1/2 -translate-x-12 -translate-y-1/2 size-20 rounded-full bg-yellow-500 text-white flex justify-center items-center">
                <Car />
            </Skeleton>
        </>
    )
}

export default LoadingSkeleton;
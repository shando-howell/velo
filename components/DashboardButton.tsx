"use client"

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const DashboardButton = () => {
    const {user, isLoaded} = useUser();

    if (!isLoaded) {
        return null;
    }
    const isAdmin = user?.publicMetadata?.role === "admin";

    return (
        <>
            {isAdmin && (<div className="px-2 uppercase font-bold">
                <Link href="/admin/dashboard">
                    Dashboard
                </Link>
            </div>)}
        </>
    )
}

export default DashboardButton;
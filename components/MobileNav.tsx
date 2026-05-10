"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return(
        <nav className="flex items-center justify-between p-4 bg-yellow-600 md:hidden">
            <Link href="/" className="text-xl text-white font-bold uppercase">
                Velo
            </Link>

            {/* Hamber Icon */}
            <button onClick={toggleMenu} className="z-50 p-2 text-white focus:outline-none">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Fullscreen Overlay */}
            <div className={`fixed inset-0 z-40 bg-yellow-600 text-white uppercase transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl font-semibold">
                    <Link href="/inventory" onClick={toggleMenu}>Cars</Link>
                    <Link href="/admin/dashboard" onClick={toggleMenu}>Dashboard</Link>
                </div>
            </div>
        </nav>
    )
}
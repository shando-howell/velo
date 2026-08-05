import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import MobileNav from "./MobileNav";
import DashboardButton from "./DashboardButton";

const Navbar = () => {
    return (
        <>
            {/* Desktop View */}
            <header className="hidden sticky top-0 w-full bg-yellow-600 p-3 md:flex flex-row items-center justify-center text-gray-200 supports-backdrop-filter:bg-yellow-600/80 backdrop-blur z-10">
                    <div className="flex-1 text-2xl uppercase font-bold tracking-widest text-white">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            <h1>Velo</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/cars" className="font-bold text-white tracking-tight">
                            CARS
                        </Link>
                        <Show when="signed-out">
                            <div className="mr-2 border text-white border-white rounded-md px-2 py-1.5 hover:bg-white hover:text-yellow-600">
                                <SignInButton mode="modal">
                                    ADMIN LOGIN
                                </SignInButton>
                            </div>
                        </Show>
                        <Show when="signed-in">
                            <DashboardButton />
                            <UserButton />
                        </Show>
                    </div>
            </header>

            {/* Mobile View */}
            <MobileNav />
        </>
    )
}

export default Navbar;
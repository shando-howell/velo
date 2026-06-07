import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import MobileNav from "./MobileNav";
import DashboardButton from "./DashboardButton";

const Navbar = () => {
    return (
        <>
            {/* Desktop View */}
            <header className="hidden sticky top-0 w-full bg-yellow-600 p-3 md:flex flex-row items-center justify-center text-gray-200 supports-backdrop-filter:bg-yellow-600/80 backdrop-blur z-10">
                    <div className="flex-1 text-2xl uppercase font-bold tracking-widest text-gray-200">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            <h1>Velo</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Show when="signed-out">
                            <div className="mr-2">
                                <SignInButton mode="modal">
                                    <Button className="text-sm font-medium text-gray-200 hover:text-gray-100 transition-colors">
                                        Sign In
                                    </Button>
                                </SignInButton>
                            </div>

                            <div>
                                <SignUpButton mode="modal">
                                    <Button className="text-sm font-medium bg-slate-900 text-white px-4 py-2 
                                    rounded-md hover:bg-slate-800 transition-colors shadow-sm">
                                        Sign Up
                                    </Button>
                                </SignUpButton>
                            </div>
                        </Show>
                        <Show when="signed-in">
                            <div className="px-2 uppercase font-bold">
                                <Link href="/cars">
                                    Cars
                                </Link>
                            </div>
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
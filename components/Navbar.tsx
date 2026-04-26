import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

const Navbar = () => {
    return (
        <header className="sticky top-0 w-full bg-yellow-400 p-2 flex text-gray-200 supports-backdrop-filter:bg-yellow-600/80 backdrop-blur z-10">
                <div className="flex-1 text-2xl uppercase tracking-widest text-gray-200">
                    <Link href="/">
                        <h1>Velo</h1>
                    </Link>
                </div>
                <div className="flex">
                    <div className="px-2">
                        <Link href="/admin/dashboard">
                            Dashboard
                        </Link>
                    </div>

                    <div className="px-2">
                        <Link href="/inventory">
                            Vehicles
                        </Link>
                    </div>
                    <Show when="signed-out">
                        <div className="mr-2">
                            <SignInButton>
                                <Button>
                                    Sign In
                                </Button>
                            </SignInButton>
                        </div>

                        <div>
                            <SignUpButton>
                                <Button>
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </div>
                    </Show>
                    <Show when="signed-in">
                        <UserButton />
                    </Show>
                </div>
        </header>
    )
}

export default Navbar;
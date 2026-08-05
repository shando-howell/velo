import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-yellow-600 text-white py-16 boprder-t border-white font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="text-2xl font-bold text-white tracking-widest uppercase">
                            Velo
                        </Link>
                        <p className="mt-4 leading-relaxed">
                            Curating the world&apos;s most exclusive high performance cars.
                            Experience engineering excellence and uncompromising luxury.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold tracking-wider uppercase mb-4">
                            Links
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/cars" className="hover:text-white transition-colors">
                                    Current Inventory
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="https://portfolio-seven-mocha-r1vvx66hik.vercel.app/" 
                                    target="_blank"
                                    className="hover:text-white transition-colors"
                                >
                                    Developer Portfolio
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Business Hours */}
                    <div>
                        <h3 className="text-white font-semibold tracking-wider uppercase mb-4">
                            Business Hours
                        </h3>
                        <ul className="space-y-3">
                            <li className="grid grid-cols-2 gap-2">
                                <span>Monday - Saturday: </span>
                                <span className="text-white">8:00 AM - 6:00 PM</span>
                            </li>
                            <li className="grid grid-cols-2 gap-2">
                                <span>Sunday: </span>
                                <span className="text-white">By Appointment Only</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; {new Date().getFullYear()} Velo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
    // Animation variants for staggered text reveal
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3, // Time between each element appearing
                delayChildren: 0.5,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
        },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-yellow-600 font-sans">

            {/* Cinematic Background with slow zoom */}
            <motion.div
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 15, ease: "easeOut" }}
                className="absolute inset-0 z-0"
            >
                {/* Gradient overlay to ensure text is always readable */}
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-yellow-600 z-10" />

                <img
                    src="/assets/images/Lambo-home.jpg"
                    alt="Lamborghini Supercar"
                    className="object-cover w-full h-full"
                />
            </motion.div>

            {/* Animated Content */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    {/* Subtle top label */}
                    <motion.span
                        variants={itemVariants}
                        className="text-amber-400 text-sm font-semibold tracking-[0.3em] uppercase mb-6"
                    >
                        Uncompromising Excellence
                    </motion.span>

                    {/* Main Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8"
                    >
                        Performance Meets <br/>
                        <span className="text-yellow-600">Prestige.</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="text-white text-lg md:text-xl max-w-2xl mb-12 font-light"
                    >
                        A curated collection of the most exclusive high-performance
                        cars. Engineered for the apex.
                    </motion.p>

                    {/* Call to Action Button */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-6"
                    >
                        <Link
                            href="/cars"
                            className="px-8 py-4 bg-yellow-600 text-white font-semibold text-sm tracking-widest
                            uppercase hover:bg-yellow-500 transition-colors duration-300"
                        >
                            Explore Inventory
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )

}
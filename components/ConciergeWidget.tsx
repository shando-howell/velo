"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function ConciergeWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [department, setDepartment] = useState<"sales" | "bespoke" | "support">("sales");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Pull in the mutation from Convex
    const submitTicket = useMutation(api.support.submitTicket);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitTicket({
                department,
                clientEmail: email,
                message,
            });

            setIsSuccess(true);

            // Reset form and close after a short delay
            setTimeout(() => {
                setIsOpen(false);
                setIsSuccess(false);
                setMessage("");
                setEmail("");
            }, 2000);
        } catch (error) {
            console.error("Failed to submit ticket:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-16 right-0 w-80 md:w-96 bg-yellow-500/90
                        backdrop-blur-xl border-yellow-600 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-yellow-600 p-4 border-b border-yellow-600 flex justify-between items-center">
                            <div>
                                <h3 className="text-white text-sm font-bold uppercase tracking-widest">
                                    Velo Concierge
                                </h3>
                                <p className="text-white text-xs mt-1">
                                    How can we assist you?
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-yellow-600 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-5">
                            {isSuccess ? (
                                <div className="h-48 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-white text-green-500 flex
                                    items-center justify-center mb-4">
                                        ✓
                                    </div>
                                    <p className="text-white font-semibold">Message Received</p>
                                    <p className="text-white text-sm mt-1">We will contact you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                                    <select 
                                        value={department}
                                        // eslint-disable-next-line
                                        onChange={(e) => setDepartment(e.target.value as any)}
                                        className="w-full bg-white border border-yellow-600
                                      text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-yellow-600
                                        transition-colors"
                                    >
                                        <option value="sales">Car Inquiry</option>
                                        <option value="bespoke">Bespoke Commissions</option>
                                        <option value="support">General Support</option>
                                    </select>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Your Email Address"
                                        required
                                        className="w-full bg-white border border-yellow-600 text-gray-900
                                        text-sm roiunded-lg p-3 focus:outline-none focustransition-colors"
                                    />

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Describe your request..."
                                        rows={3}
                                        required
                                        className="w-full bg-white border border-yellow-600
                                        text-gray-900 text-sm rounded-lg p-3 focus:outline-none 
                                        focus:border-yellow-600 transition-colors resize-none"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-white text-gray-900 text-xs font-bold uppercase
                                        tracking-widest rounded-lg hover:bg-green-400 hover:text-white transition-colors "
                                    >
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-yellow-600 text-white rounded-full shadow-xl flex
                items-center justify-center hover:bg-yellow-500 transition-colors"
            >
                {isOpen ? (
                    <span className="text-xl">✕</span>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </motion.button>
        </div>
    );
}
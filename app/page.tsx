import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import LatestListings from "@/components/LatestListings";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section>
        <div className="min-h-screen relative p-24 flex items-center justify-center">
          <Image
            src="/assets/images/Lambo-home.jpg"
            alt="Lambo Home"
            fill
            className="object-cover"
          />
          <div className="absolute top-0 left-0 size-full bg-black/25 backdrop-blur-xs"/>
          <div className="flex flex-col gap-10 text-zinc-300 relative z-10">
            <h1 className="font-semibold text-3xl lg:text-6xl max-w-3xl text-center">
              Find your dream car.
            </h1>
            <Button asChild className="mx-auto bg-yellow-600 p-8 text-base lg:text-lg text-gray-200 uppercase tracking-widest gap-5">
              <Link href="/cars">
                Explore Inventory
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Latest Arrivals Section */}
      <LatestListings />

      {/* Footer Section */}
      <div className="flex justify-center text-yellow-600 text-2xl py-2">
        <p>Velo &copy; 2026</p>
      </div>
    </>
  );
}

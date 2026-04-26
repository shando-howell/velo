import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative p-24 flex items-center justify-center">
        <Image
          src="/assets/images/Lambo-home.jpg"
          alt="Lambo Home"
          fill
          className="object-cover"
        />
        <div className="absolute top-0 left-0 size-full bg-black/25 backdrop-blur-xs"/>
        <div className="flex flex-col gap-10 text-zinc-300 relative z-10">
          <h1 className="font-semibold text-5xl max-w-3xl text-center">
            Find your dream car.
          </h1>
          <Button asChild className="mx-auto bg-yellow-600 hover:bg-yellow-400 p-8 text-lg text-gray-200 uppercase tracking-widest gap-5">
            <Link href="/inventory">
              Explore Today
            </Link>
          </Button>
        </div>
    </div>
  );
}

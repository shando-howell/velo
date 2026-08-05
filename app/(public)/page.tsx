import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import LatestListings from "@/components/LatestListings";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Latest Arrivals Section */}
      <LatestListings />
    </>
  );
}

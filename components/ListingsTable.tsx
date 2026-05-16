"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ListingsTable() {
    const cars = useQuery(api.cars.getInventory);

    if (cars === undefined) {
        return <LoadingSkeleton/>
    }

    return (
        <div className="mt-5">
            {!cars && (
                <h1 className="text-yellow-600 text-center py-20 font-bold text-3xl">
                    You have no listings.
                </h1>
            )}

            {!!cars && (<Table className="mt-5">
                <TableHeader className="uppercase bg-yellow-600">
                    <TableRow >
                        <TableHead className="text-white">
                            Make
                        </TableHead>
                        <TableHead className="text-white">
                            Model
                        </TableHead>
                        <TableHead className="text-white">
                            Price
                        </TableHead>
                        <TableHead/>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cars?.map(car => {
                        return (
                            <TableRow key={car._id}>
                                <TableCell>{car.make}</TableCell>
                                <TableCell>{car.model}</TableCell>
                                <TableCell>{car.price}</TableCell>
                                <TableCell className="flex justify-end gap-1">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/inventory/${car._id}`}>
                                            <EyeIcon />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>)}
        </div>
    )
}
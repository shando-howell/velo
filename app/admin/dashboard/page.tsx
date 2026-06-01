import ListingsTable from "@/components/ListingsTable";
import Link from "next/link";

const Dashboard = () => {
    return (
        <div className="p-6">
            <div className="flex">
                <div className="flex-1 uppercase text-yellow-600 text-xl">
                    <h2>Dashboard</h2>
                </div>
                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row">
                    <Link href="/admin/dashboard/add-listing" className="p-3 bg-yellow-600 hover:bg-yellow-500 text-white ml-8">
                        Add A New Listing
                    </Link>
                </div>
            </div>
            <ListingsTable />
        </div>
    )
}

export default Dashboard;
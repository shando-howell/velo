import InventoryList from "./InventoryList";
import Link from "next/link";

const Dashboard = () => {
    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0">
                <div className="flex-1 uppercase text-yellow-600 text-xl text-center md:text-left">
                    <h2>Admin Dashboard</h2>
                </div>
                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row ">
                    <Link href="/admin/dashboard/board" className="p-2 rounded-md bg-yellow-600 hover:bg-yellow-500 text-white ml-8">
                        Bookings
                    </Link>
                </div>
                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row ">
                    <Link href="/admin/dashboard/support" className="p-2 rounded-md bg-yellow-600 hover:bg-yellow-500 text-white ml-8">
                        Support Tickets
                    </Link>
                </div>
            </div>
            <InventoryList />
        </div>
    )
}

export default Dashboard;
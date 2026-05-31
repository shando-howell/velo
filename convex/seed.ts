import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Array of initial vehicles
    const vehicles = [
      {
        make: "Porsche",
        model: "911 Carrera",
        year: 2026,
        price: 42000000,
        imageId: "https://images.unsplash.com/photo-1503376713506-69a68bc43048?auto=format&fit=crop&q=80&w=800",
      },
      {
        make: "Rivian",
        model: "R1S",
        year: 2026,
        price: 12000000,
        imageId: "https://images.unsplash.com/photo-1695642578508-2e0618ceeb06?auto=format&fit=crop&q=80&w=800",
      },
      {
        make: "Toyota",
        model: "Tacoma TRD Pro",
        year: 2025,
        price: 8000000,
        imageId: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800",
      }
    ];

    // 2. Array of initial sales staff
    const staffMembers = [
      {
        name: "Marcus Vance",
        expertise: "Performance Vehicles",
      },
      {
        name: "Elena Rodriguez",
        expertise: "Electric & Off-Road",
      },
    ];

    // 3. Execute the insertions
    // We use Promise.all to insert everything concurrently for maximum speed
    await Promise.all([
      ...vehicles.map((car) => ctx.db.insert("cars", car)),
      ...staffMembers.map((staff) => ctx.db.insert("salesStaff", staff)),
    ]);

    return "Database successfully seeded!";
  },
});
import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
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
      ...staffMembers.map((staff) => ctx.db.insert("salesStaff", staff)),
    ]);

    return "Database successfully seeded!";
  },
});
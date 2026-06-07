import { z } from "zod";

export const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1),
    price: z.coerce.number().min(0, "Price must be positive"),
});

export type CarFormData = z.infer<typeof carFormSchema>;
import z from "zod";

export const helloSchema = z.object({
  name: z.string({ error: 'Name should be a string' }).min(1, 'Name is required'),
  email: z.email().min(1, 'Invalid email'),
});

export type HelloBody = z.infer<typeof helloSchema>;

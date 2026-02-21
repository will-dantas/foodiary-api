import z from "zod";

export const singUpSchema = z.object({
  account: z.object({
    email: z.email().min(1, 'Invalid email'),
    password: z.string().min(8, 'Password should be at least 8 characters long.'),
  }),
});

export type SingUpBody = z.infer<typeof singUpSchema>;

import { Profile } from "@application/entities/Profile";
import z from "zod";

export const singUpSchema = z.object({
  account: z.object({
    email: z.email().min(1, '"email" is required'),
    password: z.string().min(8, '"password" should be at least 8 characters long.'),
  }),
  profile: z.object({
    name: z.string().min(1, '"name" is required'),
    birthDate: z.string('"birthDate" is required, should be a valid date (YYYY-MM-DD)').date().transform(date => new Date(date)),
    gender: z.enum(Profile.Gender),
    goal: z.enum(Profile.Goal),
    height: z.number(),
    weight: z.number(),
    activityLevel: z.enum(Profile.ActivityLevel),
  }),
});

export type SingUpBody = z.infer<typeof singUpSchema>;

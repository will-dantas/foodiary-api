import { Profile } from "@application/entities/Profile";
import z from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, '"name" is required'),
  birthDate: z.string('"birthDate" is required, should be a valid date (YYYY-MM-DD)').date().transform(date => new Date(date)),
  gender: z.enum(Profile.Gender),
  height: z.number(),
  weight: z.number(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

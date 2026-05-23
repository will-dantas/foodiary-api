import z from "zod";

export const listMealsByDaySchema = z.object({
  date: z.string('"date" is required, should be a valid date (YYYY-MM-DD)').date().transform(date => new Date(date)),
});

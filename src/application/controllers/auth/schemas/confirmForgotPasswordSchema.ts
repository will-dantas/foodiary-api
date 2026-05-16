import z from "zod";

export const confirmForgotPasswordSchema = z.object({
  email: z.string().min(1, '"email" is required'),
  confirmationCode: z.string().min(1, '"confirmationCode" is required'),
  newPassword: z.string().min(6, '"newPassword" must be at least 8 characters long')
});

export type ConfirmForgotPasswordBody = z.infer<typeof confirmForgotPasswordSchema>;

import z from 'zod';

export const ValidateResponseSchema = z.object({
  client_id: z.string(),
  login: z.string(),
  scopes: z.array(z.string()),
  user_id: z.string(),
  expires_in: z.number(),
});

export type ValidateResponse = z.infer<typeof ValidateResponseSchema>;

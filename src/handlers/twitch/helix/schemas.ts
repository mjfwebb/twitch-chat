import z from "zod";

export const BadgeSetSchema = z.object({
  set_id: z.string(),
  versions: z.array(
    z.object({
      id: z.string(),
      image_url_1x: z.string(),
      image_url_2x: z.string(),
      image_url_4x: z.string(),
      title: z.string(),
      description: z.string(),
      click_action: z.string().nullable(),
      click_url: z.string().nullable(),
    })
  ),
});

export const BadgesResponseSchema = z.object({
  data: z.array(BadgeSetSchema),
});

export type BadgeSet = z.infer<typeof BadgeSetSchema>;

const CheermoteSchema = z.object({
  prefix: z.string(),
  tiers: z.array(
    z.object({
      min_bits: z.number(),
      id: z.string(),
      color: z.string(),
      images: z.object({
        dark: z.object({
          animated: z.object({
            "1": z.string(),
            "1.5": z.string(),
            "2": z.string(),
            "3": z.string(),
            "4": z.string(),
          }),
          static: z.object({
            "1": z.string(),
            "1.5": z.string(),
            "2": z.string(),
            "3": z.string(),
            "4": z.string(),
          }),
        }),
        light: z.object({
          animated: z.object({
            "1": z.string(),
            "1.5": z.string(),
            "2": z.string(),
            "3": z.string(),
            "4": z.string(),
          }),
          static: z.object({
            "1": z.string(),
            "1.5": z.string(),
            "2": z.string(),
            "3": z.string(),
            "4": z.string(),
          }),
        }),
      }),
      can_cheer: z.boolean(),
      show_in_bits_card: z.boolean(),
    })
  ),
  type: z.string(),
  order: z.number(),
  last_updated: z.string(),
  is_charitable: z.boolean(),
});

export type Cheermote = z.infer<typeof CheermoteSchema>;

export const CheersResponseSchema = z.object({
  data: z.array(CheermoteSchema),
});

export const UserInformationSchema = z.object({
  broadcaster_type: z.string(),
  created_at: z.string(),
  description: z.string(),
  display_name: z.string(),
  id: z.string(),
  login: z.string(),
  offline_image_url: z.string(),
  profile_image_url: z.string(),
  type: z.string(),
  view_count: z.number(),
});

export const UserInformationResponseSchema = z.object({
  data: z.array(UserInformationSchema),
});

export type UserInformation = z.infer<typeof UserInformationSchema>;

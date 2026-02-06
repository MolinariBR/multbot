import { z } from 'zod';

export const updateSettingsSchema = z.object({
    defaultSplitRate: z.number().min(0).max(1).optional(),
    minSplitRate: z.number().min(0).max(1).optional(),
    maxSplitRate: z.number().min(0).max(1).optional(),
    depixApiUrl: z.string().url().optional().or(z.literal('')),
    depixApiKey: z.string().optional(),
    depixWebhookSecret: z.string().optional(),
    telegramApiId: z.string().optional(),
    telegramApiHash: z.string().optional(),
    telegramPhone: z.string().optional(),
    notifyEmail: z.boolean().optional(),
    notifyTelegram: z.boolean().optional(),
    notifyMinAmount: z.number().min(0).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

import { z } from 'zod';

const splitRateSchema = z.number().min(0).max(1);
const nonNegativeAmountSchema = z.number().int().min(0);
const urlOrEmptyStringSchema = z.union([z.string().url(), z.literal('')]);

export const updateSettingsSchema = z.object({
    defaultSplitRate: splitRateSchema.optional(),
    minSplitRate: splitRateSchema.optional(),
    maxSplitRate: splitRateSchema.optional(),
    depixApiUrl: urlOrEmptyStringSchema.optional(),
    depixApiKey: z.string().optional(),
    depixWebhookSecret: z.string().optional(),
    telegramApiId: z.string().optional(),
    telegramApiHash: z.string().optional(),
    telegramPhone: z.string().optional(),
    notifyEmail: z.boolean().optional(),
    notifyTelegram: z.boolean().optional(),
    notifyMinAmount: nonNegativeAmountSchema.optional(),
}).superRefine((data, context) => {
    if (
        data.minSplitRate !== undefined
        && data.maxSplitRate !== undefined
        && data.minSplitRate > data.maxSplitRate
    ) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['minSplitRate'],
            message: 'minSplitRate não pode ser maior que maxSplitRate',
        });
    }

    if (
        data.defaultSplitRate !== undefined
        && data.minSplitRate !== undefined
        && data.defaultSplitRate < data.minSplitRate
    ) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['defaultSplitRate'],
            message: 'defaultSplitRate não pode ser menor que minSplitRate',
        });
    }

    if (
        data.defaultSplitRate !== undefined
        && data.maxSplitRate !== undefined
        && data.defaultSplitRate > data.maxSplitRate
    ) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['defaultSplitRate'],
            message: 'defaultSplitRate não pode ser maior que maxSplitRate',
        });
    }
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export type DepixWebhookStatus = 'pending' | 'completed' | 'failed';

const DEFAULT_WEBHOOK_STATUS: DepixWebhookStatus = 'pending';

const DEPIX_STATUS_TO_WEBHOOK_STATUS: Record<string, DepixWebhookStatus> = {
    pending: 'pending',
    pending_pix2fa: 'pending',
    depix_sent: 'completed',
    under_review: 'pending',
    canceled: 'failed',
    error: 'failed',
    refunded: 'failed',
    expired: 'failed',
    delayed: 'pending',
};

export function mapDepixStatusToWebhookStatus(depixStatus: string): DepixWebhookStatus {
    return DEPIX_STATUS_TO_WEBHOOK_STATUS[depixStatus] ?? DEFAULT_WEBHOOK_STATUS;
}

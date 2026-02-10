import { retryPendingDeliveries } from './notifications.service.js';

export function startNotificationsWorker() {
    // Retry loop for pending/failed deliveries (admin-only).
    const intervalMs = 60_000;

    const timer = setInterval(async () => {
        try {
            await retryPendingDeliveries({ limit: 100 });
        } catch (err) {
            console.error('❌ Notifications worker error:', err);
        }
    }, intervalMs);

    // Don't keep the process alive just because of this timer.
    (timer as any).unref?.();
}


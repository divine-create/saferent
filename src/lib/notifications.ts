import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  actionUrl?: string,
  metadata?: object
): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        actionUrl: actionUrl ?? null,
        metadata: metadata ?? undefined,
      },
    });
  } catch (err) {
    // Non-fatal — log but don't throw
    console.error("Failed to create notification:", err);
  }
}

// Mock notifications for UI development
export const mockNotifications = [
  {
    id: "mock_notif_1",
    userId: "mock_tenant_1",
    type: "RENT_DUE" as NotificationType,
    title: "Rent due in 15 days",
    body: "Your next rent payment of ₦4,500,000 for 12 Admiralty Way, Lekki Phase 1 is due on 1 June 2026.",
    actionUrl: "/tenant/property",
    isRead: false,
    readAt: null,
    metadata: { amount: "450000000", dueDate: "2026-06-01" },
    createdAt: "2026-05-16T08:00:00.000Z",
  },
  {
    id: "mock_notif_2",
    userId: "mock_tenant_1",
    type: "MAINTENANCE_UPDATE" as NotificationType,
    title: "Maintenance request acknowledged",
    body: "Your request for kitchen sink drainage has been acknowledged. A plumber is being arranged.",
    actionUrl: "/tenant/property",
    isRead: false,
    readAt: null,
    metadata: { maintenanceId: "mock_maint_1" },
    createdAt: "2026-05-15T11:00:00.000Z",
  },
  {
    id: "mock_notif_3",
    userId: "mock_tenant_1",
    type: "LEASE_RENEWAL_REMINDER" as NotificationType,
    title: "Lease renewal in progress",
    body: "Your landlord has proposed a new rent of ₦4,950,000. Review the offer and respond.",
    actionUrl: "/tenant/property",
    isRead: true,
    readAt: "2026-05-12T09:30:00.000Z",
    metadata: { renewalId: "mock_renewal_1" },
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "mock_notif_4",
    userId: "mock_tenant_1",
    type: "VIEWING_CONFIRMED" as NotificationType,
    title: "Viewing confirmed",
    body: "Your property viewing at 12 Admiralty Way, Lekki Phase 1 is confirmed for 20 May 2026 at 10:00 AM.",
    actionUrl: "/tenant",
    isRead: true,
    readAt: "2026-05-08T10:00:00.000Z",
    metadata: {},
    createdAt: "2026-05-07T14:00:00.000Z",
  },
  {
    id: "mock_notif_5",
    userId: "mock_tenant_1",
    type: "ESCROW_FUNDED" as NotificationType,
    title: "Escrow payment confirmed",
    body: "Your payment of ₦9,233,000 has been received and held in escrow for your new tenancy.",
    actionUrl: "/tenant/transactions/mock_tx_1",
    isRead: true,
    readAt: "2026-01-10T10:00:00.000Z",
    metadata: { transactionId: "mock_tx_1" },
    createdAt: "2026-01-10T09:23:00.000Z",
  },
  {
    id: "mock_notif_6",
    userId: "mock_tenant_1",
    type: "SYSTEM" as NotificationType,
    title: "Welcome to SafeRent Phase 2",
    body: "New features are now live: property management, installment payments, and more.",
    actionUrl: "/tenant",
    isRead: true,
    readAt: "2026-05-01T09:00:00.000Z",
    metadata: {},
    createdAt: "2026-05-01T08:00:00.000Z",
  },
];

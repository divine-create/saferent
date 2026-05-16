import { db } from "@/lib/db";
import { formatKoboToNaira } from "@/lib/utils";

/**
 * Called when a viewing is confirmed.
 * Creates a SYSTEM message in the conversation.
 */
export async function sendViewingConfirmedMessage(
  conversationId: string,
  date: Date
): Promise<void> {
  const formatted = date.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `Viewing confirmed for ${formatted}. Please arrive on time and bring a valid ID.`;

  await db.message.create({
    data: {
      conversationId,
      senderId: "system",
      type: "SYSTEM",
      content,
      systemEventType: "VIEWING_CONFIRMED",
      isRead: false,
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessageText: content.slice(0, 200),
    },
  });
}

/**
 * Called when escrow is funded.
 * Creates a SYSTEM message in the conversation.
 */
export async function sendEscrowFundedMessage(
  conversationId: string,
  amount: bigint
): Promise<void> {
  const formatted = formatKoboToNaira(amount);
  const content = `Escrow funded: ${formatted} has been held securely by SafeRent. The landlord will be notified when you move in and confirm the property is as described.`;

  await db.message.create({
    data: {
      conversationId,
      senderId: "system",
      type: "SYSTEM",
      content,
      systemEventType: "ESCROW_FUNDED",
      isRead: false,
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessageText: content.slice(0, 200),
    },
  });
}

/**
 * Called when a tenancy agreement needs signing.
 * Creates a SYSTEM message in the conversation.
 */
export async function sendAgreementSignatureRequest(
  conversationId: string
): Promise<void> {
  const content =
    "Your tenancy agreement is ready for signing. Please review and sign the agreement in your transactions dashboard to finalise your tenancy.";

  await db.message.create({
    data: {
      conversationId,
      senderId: "system",
      type: "SYSTEM",
      content,
      systemEventType: "AGREEMENT_SIGNATURE_REQUESTED",
      isRead: false,
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessageText: content.slice(0, 200),
    },
  });
}

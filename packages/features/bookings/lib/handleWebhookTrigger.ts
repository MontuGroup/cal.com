import getWebhooks from "@calcom/features/webhooks/lib/getWebhooks";
import type { GetSubscriberOptions } from "@calcom/features/webhooks/lib/getWebhooks";
import sendPayload from "@calcom/features/webhooks/lib/sendOrSchedulePayload";
import { isEventPayload, type WebhookPayloadType } from "@calcom/features/webhooks/lib/sendPayload";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";

export async function handleWebhookTrigger(args: {
  subscriberOptions: GetSubscriberOptions;
  eventTrigger: string;
  webhookData: WebhookPayloadType;
  isDryRun?: boolean;
}) {
  try {
    if (args.isDryRun) return;
    const subscribers = await getWebhooks(args.subscriberOptions);
    if (isEventPayload(args.webhookData)) {
      logger.info(
        `Starting webhook for event: ${args.eventTrigger} bookingId: ${args.webhookData?.bookingId} uid: ${args.webhookData?.uid}`
      );
    }
    const promises = subscribers.map((sub) =>
      sendPayload(sub.secret, args.eventTrigger, new Date().toISOString(), sub, args.webhookData)
        .then((res) => {
          if (isEventPayload(args.webhookData)) {
            logger.info(
              `Webhook Response ok: ${res?.ok} status: ${res?.status} event: ${args.eventTrigger} bookingId: ${args.webhookData?.bookingId} uid: ${args.webhookData?.uid}`
            );
          }
        })
        .catch((e) => {
          if (isEventPayload(args.webhookData)) {
            logger.error(
              `Error executing webhook for event: ${args.eventTrigger}, URL: ${sub.subscriberUrl}, booking id: ${args.webhookData.bookingId}, booking uid: ${args.webhookData.uid}`,
              safeStringify(e)
            );
            logger.error(
              `Error executing webhook for event: bookingId: ${args.webhookData?.bookingId}, uid: ${args.webhookData?.uid}`
            );
          }
        })
    );
    await Promise.all(promises);
  } catch (error) {
    logger.error("Error while sending webhook", error);
  }
}

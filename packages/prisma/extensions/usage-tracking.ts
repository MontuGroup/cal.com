import { Prisma } from "@prisma/client";

export function usageTrackingExtention() {
  return Prisma.defineExtension({
    query: {
      booking: {
        async create({ args, query }) {
          // waitUntil(incrementUsage(UsageEvent.BOOKING));
          return query(args);
        },
      },
      user: {
        async create({ args, query }) {
          // waitUntil(incrementUsage(UsageEvent.USER));
          return query(args);
        },
      },
    },
  });
}

// utils/logging.ts
import { ConvexContext } from "./_generated/server";

export async function logAuditEvent(
    ctx: ConvexContext,
    organizationId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: string
) {
    await ctx.db.insert("auditLogs", {
        organizationId,
        userId,
        action,
        resourceType,
        resourceId,
        details,
        timestamp: Date.now(),
    });
}

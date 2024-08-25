import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import QRCode from "qrcode";

export const generateQRCode = mutation({
  args: { name: v.string(), organizationId: v.string() },
  handler: async (ctx, args) => {
    const { name, organizationId } = args;

    // Check if a tenant with this organization ID already exists
    const existingTenant = await ctx.db
      .query("tenants")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .first();

    if (existingTenant) {
      throw new ConvexError("A tenant with this organization ID already exists");
    }

    // Generate a unique URL for the tenant
    const tenantUrl = `${process.env.NEXT_PUBLIC_APP_URL}/assess/${organizationId}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(tenantUrl);

    // Store the tenant information
    const tenantId = await ctx.db.insert("tenants", {
      name,
      qrCodeUrl: qrCodeDataUrl,
      organizationId,
    });

    return { tenantId, qrCodeUrl: qrCodeDataUrl };
  },
});
import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import QRCode from "qrcode";
import { Id } from "./_generated/dataModel";

export const generateOrUpdateQRCode = mutation({
  args: {
    name: v.string(),
    organizationId: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, organizationId, contactEmail, contactPhone } = args;

    // Validate input
    if (!name.trim() || !organizationId.trim() || !contactEmail.trim()) {
      throw new ConvexError("Invalid input: name, organizationId, and contactEmail are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      throw new ConvexError("Invalid email format");
    }

    // Check if a tenant with this organization ID already exists
    const existingTenant = await ctx.db
      .query("tenants")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .first();

    const timestamp = Date.now();

    // Generate a unique URL for the tenant
    const tenantUrl = `${process.env.NEXT_PUBLIC_APP_URL}/assess/${organizationId}`;

    // Generate QR code
    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(tenantUrl);
    } catch (error) {
      console.error("QR Code generation failed:", error);
      throw new ConvexError("Failed to generate QR code");
    }

    let tenantId: Id<"tenants">;

    if (existingTenant) {
      // Update existing tenant
      tenantId = existingTenant._id;
      await ctx.db.patch(tenantId, {
        name,
        qrCodeUrl: qrCodeDataUrl,
        contactEmail,
        contactPhone,
        updatedAt: timestamp,
      });
    } else {
      // Create new tenant
      tenantId = await ctx.db.insert("tenants", {
        name,
        qrCodeUrl: qrCodeDataUrl,
        organizationId,
        contactEmail,
        contactPhone,
        subscriptionStatus: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return { tenantId, qrCodeUrl: qrCodeDataUrl };
  },
});
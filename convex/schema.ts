import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
    tenants: defineTable({
        name: v.string(),
        qrCodeUrl: v.string(),
        organizationId: v.string(),
        contactEmail: v.string(),
        contactPhone: v.optional(v.string()),
        subscriptionStatus: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_subscription_status", ["subscriptionStatus"]),

    assessments: defineTable({
        tenantId: v.id("tenants"),
        clientName: v.string(),
        clientEmail: v.string(),
        vehicleMake: v.string(),
        vehicleModel: v.string(),
        vehicleYear: v.number(),
        assessmentData: v.array(v.object({
            question: v.string(),
            answer: v.string(),
        })),
        estimateAmount: v.number(),
        status: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_status", ["status"]),

    payments: defineTable({
        assessmentId: v.id("assessments"),
        amount: v.number(),
        status: v.string(),
        stripePaymentIntentId: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_assessment", ["assessmentId"])
        .index("by_status", ["status"]),
});
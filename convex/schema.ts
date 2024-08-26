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

    clients: defineTable({
        organizationId: v.string(),
        name: v.string(),
        email: v.string(),
        isActive: v.boolean(),
        createdAt: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_email", ["email"]),

    invoices: defineTable({
        organizationId: v.string(),
        clientId: v.id("clients"),
        amount: v.number(),
        status: v.string(),
        date: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_client", ["clientId"])
        .index("by_status", ["status"]),

    jobs: defineTable({
        organizationId: v.string(),
        clientId: v.id("clients"),
        serviceName: v.string(),
        amount: v.number(),
        status: v.string(),
        date: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_client", ["clientId"])
        .index("by_status", ["status"]),

    feedbacks: defineTable({
        organizationId: v.string(),
        clientId: v.id("clients"),
        jobId: v.id("jobs"),
        rating: v.number(),
        comment: v.optional(v.string()),
        date: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_client", ["clientId"])
        .index("by_job", ["jobId"]),

    organizationMemberships: defineTable({
        userId: v.string(),
        organizationId: v.string(),
        role: v.string(),
    })
        .index("by_user_org", ["userId", "organizationId"]),

    analyticsCache: defineTable({
        organizationId: v.string(),
        timeRange: v.string(),
        data: v.any(),
        timestamp: v.string(),
    })
        .index("by_organization_timeRange", ["organizationId", "timeRange"]),

    services: defineTable({
        organizationId: v.string(),
        name: v.string(),
        description: v.string(),
        basePrice: v.number(),
        priceType: v.union(v.literal("fixed"), v.literal("hourly"), v.literal("variable")),
        customFields: v.array(v.object({
            name: v.string(),
            type: v.union(v.literal("text"), v.literal("number"), v.literal("select"), v.literal("multiselect")),
            options: v.optional(v.array(v.string())),
            affects_price: v.boolean(),
            price_modifier: v.optional(v.number()),
        })),
    }).index("by_organization", ["organizationId"]),

    assessmentForms: defineTable({
        organizationId: v.string(),
        name: v.string(),
        description: v.string(),
        sections: v.array(v.object({
            title: v.string(),
            services: v.array(v.id("services")),
        })),
    }).index("by_organization", ["organizationId"]),
});
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

    organizations: defineTable({
        name: v.string(),
        settings: v.object({
            allowedFileTypes: v.array(v.string()),
            maxFileSize: v.number(),
            customFields: v.array(v.object({
                name: v.string(),
                type: v.union(v.literal("text"), v.literal("number"), v.literal("select")),
                options: v.optional(v.array(v.string())),
            })),
        }),
    }),

    assessments: defineTable({
        organizationId: v.id("organizations"),
        clientId: v.id("users"),
        vehicleDetails: v.object({
            make: v.string(),
            model: v.string(),
            year: v.number(),
            vin: v.optional(v.string()),
        }),
        selectedServices: v.array(v.object({
            serviceId: v.id("services"),
            quantity: v.number(),
            customFields: v.array(v.object({
                name: v.string(),
                value: v.union(v.string(), v.number()),
            })),
        })),
        hotspotAssessment: v.array(v.object({
            part: v.string(),
            issue: v.string(),
        })),
        mediaFiles: v.array(v.object({
            url: v.string(),
            type: v.string(),
            name: v.string(),
        })),
        estimatedPrice: v.number(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        createdAt: v.string(),
        updatedAt: v.string(),
    }).index("by_organization", ["organizationId"]).index("by_client", ["clientId"]),

    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        role: v.union(v.literal("admin"), v.literal("staff"), v.literal("client")),
    }).index("by_clerk_id", ["clerkId"]),


    bookings: defineTable({
        organizationId: v.string(),
        userId: v.string(),
        serviceId: v.id("services"),
        appointmentId: v.id("appointments"),
        status: v.union(v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("pending")),
        totalPrice: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
        deletedAt: v.optional(v.number()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_user", ["organizationId", "userId"])
        .index("by_status", ["organizationId", "status"])
        .index("by_appointment", ["appointmentId"])
        .index("by_created", ["organizationId", "createdAt"]),

    appointments: defineTable({
        organizationId: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        status: v.union(v.literal("available"), v.literal("booked"), v.literal("unavailable")),
        createdAt: v.number(),
        updatedAt: v.number(),
        deletedAt: v.optional(v.number()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_time", ["organizationId", "startTime"])
        .index("by_status", ["organizationId", "status"]),

    availableSlots: defineTable({
        organizationId: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        createdAt: v.number(),
        deletedAt: v.optional(v.number()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_time", ["organizationId", "startTime"]),


    auditLogs: defineTable({
        organizationId: v.string(),
        userId: v.string(),
        action: v.string(),
        resourceType: v.string(),
        resourceId: v.string(),
        details: v.string(),
        timestamp: v.number(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_user", ["organizationId", "userId"])
        .index("by_action", ["organizationId", "action"]),
});
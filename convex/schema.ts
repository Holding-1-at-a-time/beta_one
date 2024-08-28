import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
    tenants: defineTable({
        name: v.string(),
        qrCodeUrl: v.string(),
        organizationId: v.id('organizations'),
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
        organizationId: v.id('organizations'),
        name: v.string(),
        email: v.string(),
        isActive: v.boolean(),
        createdAt: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_email", ["email"]),

    invoices: defineTable({
        organizationId: v.id('organizations'),
        clientId: v.id("clients"),
        amount: v.number(),
        status: v.string(),
        date: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_client", ["clientId"])
        .index("by_status", ["status"]),

    jobs: defineTable({
        organizationId: v.id('organizations'),
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
        organizationId: v.id('organizations'),
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
        userId: v.id(users),
        organizationId: v.id('organizations'),
        role: v.string(),
    })
        .index("by_user_org", ["userId", "organizationId"]),

    analyticsCache: defineTable({
        organizationId: v.id('organizations'),
        name: v.string(),
        description: v.string(),
        timeRange: v.string(),
        data: v.any(),
        timestamp: v.string(),
    })
        .index("by_organization_timeRange", ["organizationId", "timeRange"]),

    services: defineTable({
        organizationId: v.id('organizations'),
        name: v.string(),
        description: v.string(),
        basePrice: v.number(),
        priceModifier: v.optional(v.number()),
        duration: v.number(),
        durationType: v.union(v.literal("minutes"), v.literal("hours"), v.literal("days")),
        priceModifierType: v.union(v.literal("fixed"), v.literal("percentage")),
        priceModifierValue: v.optional(v.number()),
        priceModifierDuration: v.optional(v.number()),
        priceType: v.union(v.literal("fixed"), v.literal("hourly"), v.literal("variable")),
        customFields: v.array(v.object({
            name: v.string(),
            label: v.string(),
            description: v.optional(v.string()),
            organizationId: v.id('organizations'), name: v.string(),
            type: v.union(v.literal("text"), v.literal("number"), v.literal("select"), v.literal("multiselect")),
            options: v.optional(v.array(v.string())),
            affects_price: v.boolean(),
            price_modifier: v.optional(v.number()),
            price_modifier_type: v.optional(v.union(v.literal("fixed"), v.literal("percentage"))),
            price_modifier_value: v.optional(v.number()),
            price_modifier_duration: v.optional(v.number()),
        })),
    }).index("by_organization", ["organizationId"]),

    assessmentForms: defineTable({
        organizationId: v.id('organizations'),
        name: v.string(),
        description: v.string(),
        sections: v.array(v.object({
            title: v.string(),
            services: v.array(v.id("services")),
        })),
    }).index("by_organization", ["organizationId"]),

    organizations: defineTable({
        qrCodeUrl: v.string(),
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        organizationId: v.id('organizations'),
        subscriptionId: v.optional(v.id("subscriptions")),
        name: v.string(),
        contactEmail: v.string(),
        contactPhone: v.optional(v.string()),
        subscriptionStatus: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        settings: v.object({
            allowSignup: v.boolean(),
            defaultRole: v.string(),
            defaultLanguage: v.string(),
            defaultTimezone: v.string(),
            defaultCurrency: v.string(),
            defaultService: v.id("services"),
            allowedFileTypes: v.array(v.string()),
            maxFileSize: v.number(),
            maxFileCount: v.number(),
            maxJobCount: v.number(),
            customFields: v.array(v.object({
                name: v.string(),
                description: v.string(),
                required: v.boolean(),
                default: v.any(),
                type: v.union(v.literal("text"), v.literal("number"), v.literal("select")),
                options: v.optional(v.array(v.string())),
                affects_price: v.boolean(),
                price_modifier: v.optional(v.number()),
                visible: v.boolean(),
                order: v.number(),
            })),
        }),
    }),

    assessments: defineTable({
        organizationId: v.id("organizations"),
        clientId: v.id("users"),
        serviceId: v.id("services"),
        assessmentFormId: v.id("assessmentForms"),
        date: v.string(),
        time: v.string(),
        notes: v.optional(v.string()),
        assessmentType: v.union(v.literal("hotspot"), v.literal("vehicle")),
        vehicleType: v.union(v.literal("sedan"), v.literal("suv"), v.literal("truck"), v.literal("van")),
        vehicleRegistration: v.optional(v.string()),
        vehicleDetails: v.object({
            make: v.string(),
            model: v.string(),
            year: v.number(),
            color: v.optional(v.string()),
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
            hotspot: v.string(),
            hotspotType: v.union(v.literal("hotspot"), v.literal("vehicle")),
            hotspotDetails: v.object({
                make: v.string(),
                model: v.string(),
                year: v.number(),
                color: v.optional(v.string()),
                vin: v.optional(v.string()),
                licensePlate: v.optional(v.string()),
            }),
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
        deletedAt: v.optional(v.string()),
        deletedBy: v.optional(v.string()),
        deletedReason: v.optional(v.string()),
    })
        .index("by_organization", ["organizationId"]).index("by_client", ["clientId"])
        .index("by_service", ["serviceId"]),



    users: defineTable({
        clerkId: v.id(),
        firstName: v.string(),
        lastName: v.string(),
        organizationId: v.id('organizations'),
        phone: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
        country: v.string(),
        dob: v.string(),
        gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
        image: v.url(),
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("management"), v.literal("client"), v.literal("member"), v.literal("non-memeber")),
    }).index("by_clerk_id", ["clerkId"]),


    bookings: defineTable({
        organizationId: v.id('organizations'),
        userId: v.id('users'),
        serviceId: v.id("services"),
        service: v.string(),
        date: v.string(),
        notes: v.optional(v.string()),
        appointmentId: v.id("appointments"),
        status: v.union(v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("pending")),
        totalPrice: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
        deletedAt: v.optional(v.number()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_user", ["organizationId", "userId"])
        .index("by_date", ["organizationId", "date"])
        .index("by_appointment", ["organizationId", "appointmentId"])
        .index("by_user_and_status", ["organizationId", "userId", "status"])
        .index("by_status", ["organizationId", "status"])
        .index("by_appointment", ["appointmentId"])
        .index("by_created", ["organizationId", "createdAt"]),

    appointments: defineTable({
        organizationId: v.id('organizations'),
        customer: v.string(),
        clientId: v.id('clients'),
        serviceId: v.id('services'),
        service: v.string(),
        date: v.string(),
        notes: v.optional(v.string()),
        createdBy: v.string(),
        createdAt: v.string(),
        updatedAt: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        status: v.union(v.literal("available"), v.literal("scheduled"), v.literal("completed"), v.literal("cancelled"), v.literal("booked"), v.literal("unavailable")),
    })
        .index("by_organization", ["organizationId"])
        .index("by_organization_and_date", ["organizationId", "date"])
        .index("by_time", ["organizationId", "startTime"])
        .index("by_status", ["organizationId", "status"]),

    availableSlots: defineTable({
        organizationId: v.id('organizations'),
        startTime: v.number(),
        endTime: v.number(),
        createdAt: v.number(),
        deletedAt: v.optional(v.number()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_time", ["organizationId", "startTime"]),


    auditLogs: defineTable({
        organizationId: v.id('organizations'),
        userId: v.id('users'),
        userName: v.string(),
        userRole: v.string(),
        organizationName: v.string(),
        organizationEmail: v.string(),
        organizationPhone: v.string(),
        organizationAddress: v.string(),
        organizationDetails: v.optional(v.string()),
        organizationWebsite: v.optional(v.string()),
        organizationLogo: v.optional(v.string()),
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
// convex/assessments.ts
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitAssessment = mutation({
    args: {
        organizationId: v.string(),
        vehicleDetails: v.object({
            make: v.string(),
            model: v.string(),
            year: v.number(),
            condition: v.string(),
        }),
        hotspotAssessment: v.array(v.object({
            part: v.string(),
            issue: v.string(),
        })),
        selectedServices: v.array(v.object({
            id: v.id("services"),
            quantity: v.number(),
        })),
        images: v.array(v.object({
            url: v.string(),
            type: v.string(),
        })),
        videos: v.array(v.object({
            url: v.string(),
            type: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const { organizationId, vehicleDetails, hotspotAssessment, selectedServices, images, videos } = args;

        // Verify user has permission to submit assessments for this organization
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        const assessmentId = await ctx.db.insert("assessments", {
            organizationId,
            vehicleDetails,
            hotspotAssessment,
            selectedServices,
            images,
            videos,
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        return { assessmentId };
    },
});

export const getAssessmentSummary = query({
    args: { assessmentId: v.id("assessments") },
    handler: async (ctx, args) => {
        const { assessmentId } = args;

        const assessment = await ctx.db.get(assessmentId);
        if (!assessment) throw new Error("Assessment not found");

        // Fetch service details
        const services = await Promise.all(
            assessment.selectedServices.map(async (service) => {
                const serviceDetails = await ctx.db.get(service.id);
                return { ...serviceDetails, quantity: service.quantity };
            })
        );

        // Calculate total price
        const totalPrice = services.reduce((total, service) => {
            return total + (service.basePrice * service.quantity);
        }, 0);

        return {
            vehicleDetails: assessment.vehicleDetails,
            selectedServices: services,
            customizations: assessment.hotspotAssessment,
            totalPrice,
        };
    },
});

export const uploadPhotoMetadata = mutation({
    args: {
        files: v.array(v.object({
            url: v.string(),
            type: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const { files } = args;

        // In a real-world scenario, you might want to store this information
        // in your database or perform additional processing
        console.log("Received file metadata:", files);

        return { success: true };
    },
});
export const submit = mutation({
    args: {
        tenantId: v.id("tenants"),
        clientName: v.string(),
        clientEmail: v.string(),
        vehicleInfo: v.object({
            make: v.string(),
            model: v.string(),
            year: v.string(),
        }),
        assessmentData: v.array(v.object({
            question: v.string(),
            answer: v.string(),
        })),
        estimateAmount: v.number(),
    },
    handler: async (ctx, args) => {
        const { tenantId, clientName, clientEmail, vehicleInfo, assessmentData, estimateAmount } = args;

        // Validate input
        if (!clientName.trim() || !clientEmail.trim()) {
            throw new ConvexError("Invalid input: clientName and clientEmail are required");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
            throw new ConvexError("Invalid email format");
        }

        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new ConvexError("Tenant not found");
        }

        const timestamp = Date.now();

        const assessmentId = await ctx.db.insert("assessments", {
            tenantId,
            clientName,
            clientEmail,
            vehicleMake: vehicleInfo.make,
            vehicleModel: vehicleInfo.model,
            vehicleYear: parseInt(vehicleInfo.year),
            assessmentData,
            estimateAmount,
            status: "pending",
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return assessmentId;
    },
});
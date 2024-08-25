// convex/assessments.ts
import { mutation, v } from "./_generated/server";
import { ConvexError } from "convex/values";

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
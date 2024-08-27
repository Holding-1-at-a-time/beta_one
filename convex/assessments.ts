// convex/assessments.ts
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";

export const submitAssessment = mutation({
    args: {
        organizationId: v.id("organizations"),
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
    },
    handler: async (ctx, args) => {
        const { organizationId, vehicleDetails, selectedServices, hotspotAssessment, mediaFiles } = args;

        // Verify user has permission to submit assessments for this organization
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new ConvexError("Unauthenticated");

        const userId = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.subject))
            .unique();
        if (!userId) throw new ConvexError("User not found");

        const membership = await ctx.db
            .query("organizationMemberships")
            .withIndex("by_user_and_org", (q) =>
                q.eq("userId", userId._id).eq("organizationId", organizationId)
            )
            .unique();
        if (!membership) throw new ConvexError("User is not a member of this organization");

        // Calculate estimated price
        const estimatedPrice = await calculateEstimatedPrice(ctx, organizationId, selectedServices);

        const assessmentId = await ctx.db.insert("assessments", {
            organizationId,
            clientId: userId._id,
            vehicleDetails,
            selectedServices,
            hotspotAssessment,
            mediaFiles,
            estimatedPrice,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return { assessmentId, estimatedPrice };
    },
});

async function calculateEstimatedPrice(
    ctx: any,
    organizationId: Id<"organizations">,
    selectedServices: Array<{
        serviceId: Id<"services">;
        quantity: number;
        customFields: Array<{ name: string; value: string | number }>;
    }>
): Promise<number> {
    let totalPrice = 0;

    for (const selectedService of selectedServices) {
        const service = await ctx.db.get(selectedService.serviceId);
        if (!service || service.organizationId !== organizationId) {
            throw new ConvexError("Invalid service selected");
        }

        let servicePrice = service.basePrice * selectedService.quantity;

        for (const customField of service.customFields) {
            if (customField.affects_price) {
                const selectedValue = selectedService.customFields.find(f => f.name === customField.name)?.value;
                if (selectedValue && customField.price_modifier) {
                    if (typeof selectedValue === "number") {
                        servicePrice += selectedValue * customField.price_modifier;
                    } else if (customField.options) {
                        const index = customField.options.indexOf(selectedValue);
                        if (index !== -1) {
                            servicePrice += index * customField.price_modifier;
                        }
                    }
                }
            }
        }

        totalPrice += servicePrice;
    }

    return totalPrice;
}

export const getAssessmentSummary = query({
    args: { assessmentId: v.id("assessments") },
    handler: async (ctx, args) => {
        const { assessmentId } = args;

        const assessment = await ctx.db.get(assessmentId);
        if (!assessment) throw new ConvexError("Assessment not found");

        // Verify user has permission to view this assessment
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new ConvexError("Unauthenticated");

        const userId = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.subject))
            .unique();
        if (!userId) throw new ConvexError("User not found");

        const membership = await ctx.db
            .query("organizationMemberships")
            .withIndex("by_user_and_org", (q) =>
                q.eq("userId", userId._id).eq("organizationId", assessment.organizationId)
            )
            .unique();
        if (!membership && userId._id !== assessment.clientId) {
            throw new ConvexError("User does not have permission to view this assessment");
        }

        // Fetch service details
        const services = await Promise.all(
            assessment.selectedServices.map(async (service) => {
                const serviceDetails = await ctx.db.get(service.serviceId);
                return { ...serviceDetails, quantity: service.quantity, customFields: service.customFields };
            })
        );

        return {
            assessmentId: assessment._id,
            vehicleDetails: assessment.vehicleDetails,
            selectedServices: services,
            hotspotAssessment: assessment.hotspotAssessment,
            mediaFiles: assessment.mediaFiles,
            estimatedPrice: assessment.estimatedPrice,
            status: assessment.status,
            createdAt: assessment.createdAt,
            updatedAt: assessment.updatedAt,
        };
    },
});

export const processAssessmentWithAI = action({
    args: { assessmentId: v.id("assessments") },
    handler: async (ctx, args) => {
        const { assessmentId } = args;

        // Fetch the assessment data
        const assessment = await ctx.runQuery(getAssessmentSummary, { assessmentId });

        // In a real-world scenario, you would send this data to an AI service
        // and receive intelligent insights or recommendations
        const aiInsights = await simulateAIProcessing(assessment);

        // Update the assessment with AI insights
        await ctx.runMutation(updateAssessmentWithAIInsights, {
            assessmentId,
            aiInsights,
        });

        return { success: true, aiInsights };
    },
});

async function simulateAIProcessing(assessment: any) {
    // This is a placeholder for actual AI processing
    return {
        recommendedServices: ["Full Detailing", "Paint Protection"],
        estimatedTimeToComplete: "4 hours",
        potentialIssues: ["Minor scratches on driver's side door", "Wear on brake pads"],
    };
}

const updateAssessmentWithAIInsights = mutation({
    args: {
        assessmentId: v.id("assessments"),
        aiInsights: v.object({
            recommendedServices: v.array(v.string()),
            estimatedTimeToComplete: v.string(),
            potentialIssues: v.array(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const { assessmentId, aiInsights } = args;
        await ctx.db.patch(assessmentId, { aiInsights, updatedAt: new Date().toISOString() });
    },
});

export const getRecentAssessments = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const assessments = await ctx.db
            .query('assessments')
            .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
            .order('desc')
            .take(8);

        return assessments;
    },
});
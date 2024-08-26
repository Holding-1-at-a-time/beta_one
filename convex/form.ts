
// convex/assessmentForms.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAssessmentForm = mutation({
    args: {
        organizationId: v.string(),
        name: v.string(),
        description: v.string(),
        sections: v.array(v.object({
            title: v.string(),
            services: v.array(v.id("services")),
        })),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        // Verify user has permission to create assessment forms for this organization
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        const formId = await ctx.db.insert("assessmentForms", args);
        return formId;
    },
});

export const updateAssessmentForm = mutation({
    args: {
        formId: v.id("assessmentForms"),
        // ... (include all fields from createAssessmentForm, but make them optional)
    },
    handler: async (ctx, args) => {
        const { formId, ...updateFields } = args;

        // Verify user has permission to update this assessment form
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        await ctx.db.patch(formId, updateFields);
        return formId;
    },
});

export const getAssessmentForms = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        // Verify user has permission to view assessment forms for this organization
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        const forms = await ctx.db
            .query("assessmentForms")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .collect();

        return forms;
    },
});
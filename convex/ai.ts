// convex/ai.ts
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateAssessmentQuestions = action({
    args: {
        tenantId: v.id("tenants"),
        vehicleInfo: v.object({
            make: v.string(),
            model: v.string(), 
            year: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const { tenantId, vehicleInfo } = args;

        const tenant = await ctx.runQuery("tenants:getTenantById", { id: tenantId });
        if (!tenant) {
            throw new ConvexError("Tenant not found");
        }

        const prompt = `Generate 5 specific assessment questions for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} 
    that will be detailed. The questions should help determine the condition of the vehicle and the level of detailing required. 
    Format the output as a JSON array of objects, each with 'id', 'question', 'type' (either 'text', 'select', or 'number'), 
    and 'options' (an array of strings, only for 'select' type) properties.`;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
            });

            const questions = JSON.parse(response.choices[0].message.content || '[]');
            return questions;
        } catch (error) {
            console.error("Error generating assessment questions:", error);
            throw new ConvexError("Failed to generate assessment questions");
        }
    },
});

export const generateEstimate = action({
    args: {
        tenantId: v.id("tenants"),
        vehicleInfo: v.object({
            make: v.string(),
            model: v.string(),
            year: v.string(),
        }),
        assessmentData: v.array(v.object({
            question: v.string(),
            answer: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const { tenantId, vehicleInfo, assessmentData } = args;

        const tenant = await ctx.runQuery("tenants:getTenantById", { id: tenantId });
        if (!tenant) {
            throw new ConvexError("Tenant not found");
        }

        const prompt = `Based on the following assessment data for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}, 
    provide an estimated cost for a full detailing service. Consider the vehicle's condition and the level of detailing required. 
    Assessment data:
    ${JSON.stringify(assessmentData, null, 2)}
    
    Provide the estimate as a single number representing the total cost in USD.`;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
            });

            const estimateAmount = parseFloat(response.choices[0].message.content || '0');
            return estimateAmount;
        } catch (error) {
            console.error("Error generating estimate:", error);
            throw new ConvexError("Failed to generate estimate");
        }
    },
});
// convex/ai.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";

interface OllamaResponse {
    response: string;
    error?: string;
}

async function queryOllama(prompt: string): Promise<OllamaResponse> {
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama2',
            prompt,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
}

export const generateAIAssessment = action({
    args: { assessmentId: v.id("assessments") },
    handler: async (ctx, args) => {
        const assessment = await ctx.runQuery(internal.assessments.getAssessmentById, { id: args.assessmentId });
        if (!assessment) {
            throw new ConvexError("Assessment not found");
        }

        const prompt = `
      Analyze the following vehicle assessment and provide recommendations:
      Vehicle: ${assessment.vehicleDetails.year} ${assessment.vehicleDetails.make} ${assessment.vehicleDetails.model}
      Condition: ${JSON.stringify(assessment.hotspotAssessment)}
      Selected Services: ${JSON.stringify(assessment.selectedServices)}
      
      Please provide:
      1. A summary of the vehicle's condition
      2. Recommended additional services based on the assessment
      3. An estimated time to complete all services
      4. Any potential issues or concerns
    `;

        try {
            const aiResponse = await queryOllama(prompt);
            if (aiResponse.error) {
                throw new Error(aiResponse.error);
            }

            const aiAssessment = {
                summary: aiResponse.response,
                timestamp: new Date().toISOString(),
            };

            await ctx.runMutation(internal.assessments.updateAssessmentWithAI, {
                id: args.assessmentId,
                aiAssessment,
            });

            return aiAssessment;
        } catch (error) {
            console.error("AI Assessment generation failed:", error);
            throw new ConvexError("Failed to generate AI assessment");
        }
    },
});
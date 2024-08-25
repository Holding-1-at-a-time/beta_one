// convex/payments.ts
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export const createPaymentIntent = action({
    args: {
        assessmentId: v.id("assessments"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const { assessmentId, amount } = args;

        const assessment = await ctx.runQuery("assessments:getAssessmentById", { id: assessmentId });
        if (!assessment) {
            throw new ConvexError("Assessment not found");
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects amount in cents
                currency: 'usd',
                metadata: {
                    assessmentId: assessmentId,
                },
            });

            await ctx.runMutation("payments:createPaymentRecord", {
                assessmentId,
                amount,
                status: 'pending',
                stripePaymentIntentId: paymentIntent.id,
            });

            return {
                clientSecret: paymentIntent.client_secret,
            };
        } catch (error) {
            console.error("Error creating payment intent:", error);
            throw new ConvexError("Failed to create payment intent");
        }
    },
});

export const createPaymentRecord = mutation({
    args: {
        assessmentId: v.id("assessments"),
        amount: v.number(),
        status: v.string(),
        stripePaymentIntentId: v.string(),
    },
    handler: async (ctx, args) => {
        const { assessmentId, amount, status, stripePaymentIntentId } = args;

        const timestamp = Date.now();

        const paymentId = await ctx.db.insert("payments", {
            assessmentId,
            amount,
            status,
            stripePaymentIntentId,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return paymentId;
    },
});
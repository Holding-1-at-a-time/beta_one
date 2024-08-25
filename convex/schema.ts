import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tenants: defineTable({
    organization_id: v.id('organizations'),
    name: v.string(),
    qr_code_url: v.string(),
  }),
    
  services: defineTable({
    tenant_id: v.id("tenants"),
    service_name: v.string(),
    price: v.number(),
  }),
  assessments: defineTable({
    tenant_id: v.id("tenants"),
    client_name: v.string(),
    client_contact: v.string(),
    services_selected: v.union(),
    total_price: v.number(),
    created_at: v.string(),
  }),
});
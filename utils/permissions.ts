// utils/permissions.ts
import { ConvexContext } from "./_generated/server";

export enum UserRole {
    Admin = "admin",
    Staff = "staff",
    Customer = "customer",
}

export async function checkUserPermission(
    ctx: ConvexContext,
    organizationId: string,
    requiredRole: UserRole
): Promise<boolean> {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return false;

    const userRole = await ctx.db
        .query("userRoles")
        .withIndex("by_user_org", (q) => q.eq("userId", user.subject).eq("organizationId", organizationId))
        .unique();

    if (!userRole) return false;

    const roleHierarchy = [UserRole.Customer, UserRole.Staff, UserRole.Admin];
    return roleHierarchy.indexOf(userRole.role as UserRole) >= roleHierarchy.indexOf(requiredRole);
}
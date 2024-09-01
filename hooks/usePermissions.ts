// hooks/usePermissions.ts
import { useUser } from '@clerk/nextjs';

type Permission = 'create_appointment' | 'edit_appointment' | 'cancel_appointment';

export function usePermissions() {
    const { user } = useUser();

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;

        // This is a simplified permission check. In a real-world application,
        // you'd want to implement more sophisticated role-based access control.
        const userRole = user.publicMetadata.role as string | undefined;

        switch (permission) {
            case 'create_appointment':
                return userRole === 'admin' || userRole === 'staff';
            case 'edit_appointment':
                return userRole === 'admin' || userRole === 'staff';
            case 'cancel_appointment':
                return userRole === 'admin' || userRole === 'staff' || userRole === 'client';
            default:
                return false;
        }
    };

    return { hasPermission };
}
// hooks/useAppSettings.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useAppSettings() {
    const settings = useQuery(api.settings.getAppSettings);

    return {
        timeZone: settings?.timeZone || 'UTC',
        dateFormat: settings?.dateFormat || 'yyyy-MM-dd',
        timeFormat: settings?.timeFormat || 'HH:mm',
    };
}
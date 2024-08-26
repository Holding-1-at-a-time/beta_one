// utils/withAuth.tsx
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export function withAuth(Component) {
    return function AuthenticatedComponent(props) {
        const { isLoaded, isSignedIn, user } = useUser();
        const router = useRouter();

        if (!isLoaded) {
            return <div>Loading...</div>;
        }

        if (!isSignedIn) {
            router.replace('/sign-in');
            return null;
        }

        return <Component {...props} />;
    };
}
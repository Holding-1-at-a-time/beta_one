// components/HeaderComponent.tsx
import Link from 'next/link';
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';
import { MountainIcon } from './Icons';

const Header: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <header className={`bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between animated-3d ${className}`}>
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg" prefetch={false}>
                <MountainIcon className="h-6 w-6" />
                <span>Slick Solutions</span>
            </Link>
            <nav className="flex items-center gap-4">
                <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                    Features
                </Link>
                <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                    Pricing
                </Link>
                <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                    About
                </Link>
                <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                    Contact
                </Link>
                <OrganizationSwitcher />
                <UserButton />
            </nav>
        </header>
    );
};

export default Header;
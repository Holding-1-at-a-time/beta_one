// components/SidebarComponent.tsx
import Link from 'next/link';
import { BellIcon, BriefcaseIcon, CalendarIcon, CoinsIcon, HomeIcon, InfoIcon, MountainIcon, ReceiptIcon, SettingsIcon, UsersIcon } from './public/Icons';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`bg-muted/40 border-r ${className}`}>
      <div className="flex h-full max-h-screen flex-col gap-2 parallax">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <MountainIcon className="h-6 w-6" />
            <span>Slick Solutions</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary pulse">
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/services" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary slide-in">
              <BriefcaseIcon className="h-4 w-4" />
              Services
            </Link>
            <Link href="/assessments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary zoom-in">
              <InfoIcon className="h-4 w-4" />
              Assessments
            </Link>
            <Link href="/appointments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary rotate-in">
              <CalendarIcon className="h-4 w-4" />
              Appointments
            </Link>
            <Link href="/invoices" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <ReceiptIcon className="h-4 w-4" />
              Invoices
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <CoinsIcon className="h-4 w-4" />
              Analytics
            </Link>
            <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
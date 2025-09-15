'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  PlusCircle, 
  BarChart3, 
  FileText, 
  Settings,
  Home,
  Database,
  Download,
  Upload
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/buyers',
    icon: Home,
    description: 'Overview and stats',
  },
  {
    name: 'All Leads',
    href: '/buyers',
    icon: Users,
    description: 'View all buyer leads',
  },
  {
    name: 'Add Lead',
    href: '/buyers/new',
    icon: PlusCircle,
    description: 'Create new lead',
  },
];

const tools = [
  {
    name: 'Import Data',
    href: '/buyers?import=true',
    icon: Upload,
    description: 'Import from CSV',
  },
  {
    name: 'Export Data',
    href: '/buyers?export=true',
    icon: Download,
    description: 'Export to CSV',
  },
];

const secondary = [
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    disabled: true,
    description: 'Coming soon',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    disabled: true,
    description: 'Coming soon',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    disabled: true,
    description: 'Coming soon',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Lead Intake</h1>
            <p className="text-xs text-gray-500">Real Estate CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {/* Main Navigation */}
        <div>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Main
          </h2>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href === '/buyers' && pathname.startsWith('/buyers'));
            
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto p-3',
                  isActive && 'bg-primary/10 text-primary border border-primary/20'
                )}
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Tools */}
        <div>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tools
          </h2>
          {tools.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className="w-full justify-start h-auto p-3"
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Secondary Navigation */}
        <div>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            More
          </h2>
          {secondary.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.name}
                asChild={!item.disabled}
                variant="ghost"
                className={cn(
                  'w-full justify-start h-auto p-3',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
                disabled={item.disabled}
              >
                {item.disabled ? (
                  <div className="flex items-start">
                    <Icon className="mr-3 h-4 w-4 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={item.href}>
                    <Icon className="mr-3 h-4 w-4 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-center text-xs text-gray-500">
          <p>Buyer Lead Intake v1.0</p>
          <p className="mt-1">Built with Next.js</p>
        </div>
      </div>
    </div>
  );
}
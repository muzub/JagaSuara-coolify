'use client';

import Link from 'next/link';
import { Settings, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Volume2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">Quietude</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/admin" passHref legacyBehavior>
            <Button variant="ghost" size="icon" aria-label="Admin Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}


import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';
import ClientLayout from '@/components/ClientLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JagaSuara - Ketenangan Terjaga',
  description: 'JagaSuara - Ketenangan Terjaga. Monitor tingkat kebisingan untuk menjaga lingkungan yang tenang.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams(); // Explicitly invoke the hook

  useEffect(() => {
    // Set metadata dynamically for client component
    document.title = 'JagaSuara - Ketenangan Terjaga';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'JagaSuara - Ketenangan Terjaga. Monitor tingkat kebisingan untuk menjaga lingkungan yang tenang.');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = 'JagaSuara - Ketenangan Terjaga. Monitor tingkat kebisingan untuk menjaga lingkungan yang tenang.';
      document.head.appendChild(newMeta);
    }


    const APP_THEME_KEY = 'quietude_appTheme';
    const applyTheme = (themeId: AppThemeId | null) => {
      const root = document.documentElement;
      const currentTheme = themeId || 'system'; // Default to system if null

      if (currentTheme === 'light') {
        root.classList.remove('dark');
      } else if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else { // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    const storedTheme = localStorage.getItem(APP_THEME_KEY) as AppThemeId | null;
    applyTheme(storedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const currentSelectedTheme = localStorage.getItem(APP_THEME_KEY) as AppThemeId | null;
      if (!currentSelectedTheme || currentSelectedTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Listen for storage changes to update theme dynamically
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === APP_THEME_KEY) {
            applyTheme(event.newValue as AppThemeId | null);
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // No need to add searchParams to dependency array if its value isn't used in this useEffect

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <main className="flex flex-col flex-grow">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}

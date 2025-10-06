import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    weight: ['100', '200', '300', '400', '500', '600', '700'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Entertainment Web App',
    description: 'Your personal entertainment hub for movies and TV shows',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={outfit.variable}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}

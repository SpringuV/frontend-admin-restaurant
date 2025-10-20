import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-rovider";
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const inter = Inter({
	subsets: ['latin'],
	display: 'swap', // Quan trọng!
	preload: true,
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
    title: 'Admin',
    description: 'Trang quản lý',
    icons: {
        icon: '/icon3.png',
    },
};


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className={inter.className} lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						{children}
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}

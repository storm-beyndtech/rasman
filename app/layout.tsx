import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/provider/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Rasman Music - Conscious Reggae Music by Rasman Peter Dudu",
	description:
		"Official music platform of Rasman Peter Dudu. Stream and download authentic reggae music with conscious messages of love, unity, and spirituality.",
	keywords:
		"Rasman, Peter Dudu, reggae music, conscious music, Jamaican music, roots reggae, spiritual music",
	authors: [{ name: "Rasman Peter Dudu" }],
	openGraph: {
		title: "Rasman Music - Conscious Reggae Music",
		description: "Official music platform of Rasman Peter Dudu. Stream and download authentic reggae music.",
		url: "https://rasmanpeter.com",
		siteName: "Rasman Music",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Rasman Music - Conscious Reggae Music",
		description: "Official music platform of Rasman Peter Dudu. Stream and download authentic reggae music.",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<head>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link
						href="https://fonts.googleapis.com/css2?family=Babylonica&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
						rel="stylesheet"
					/>
				</head>
				<body className={`${inter.className} antialiased`}>
					<Providers>
						<div className="flex flex-col min-h-screen">
							<Navbar />
							<main className="flex-grow">{children}</main>
							<Footer />
						</div>
					</Providers>
				</body>
			</html>
		</ClerkProvider>
	);
}

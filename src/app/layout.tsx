//src/app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Hudle.io",
	description: "Create and play Wordle-like games",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<Header />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}

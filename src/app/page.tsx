"use client";

import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen p-8">
			<div className="max-w-md mx-auto">
				<h1 className="text-2xl font-bold mb-4">Welcome to Hudle.io</h1>
				<div className="space-y-4">
					<Link
						href="/auth/login"
						className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
					>
						Login
					</Link>
					<Link
						href="/auth/signup"
						className="block w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
					>
						Sign Up
					</Link>
				</div>
			</div>
		</main>
	);
}

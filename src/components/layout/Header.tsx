"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
	const { user, logout } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<header className="bg-white shadow-sm">
			<nav
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
				aria-label="Top"
			>
				<div className="w-full py-6 flex items-center justify-between border-b border-gray-200">
					<div className="flex items-center">
						<Link
							href="/"
							className="text-2xl font-bold text-gray-900"
						>
							Hudle.io
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						<Link
							href="/"
							className="text-gray-500 hover:text-gray-900"
						>
							Home
						</Link>

						{user ? (
							<>
								<Link
									href="/creator/create"
									className="text-gray-500 hover:text-gray-900"
								>
									Create Game
								</Link>
								<button
									onClick={handleLogout}
									className="text-gray-500 hover:text-gray-900"
								>
									Sign Out
								</button>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									className="text-gray-500 hover:text-gray-900"
								>
									Sign In
								</Link>
								<Link
									href="/auth/signup"
									className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden">
						<button
							type="button"
							className="text-gray-400 hover:text-gray-500"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							<span className="sr-only">Open menu</span>
							{isMenuOpen ? (
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden py-4">
						<div className="flex flex-col space-y-4">
							<Link
								href="/"
								className="text-gray-500 hover:text-gray-900"
								onClick={() => setIsMenuOpen(false)}
							>
								Home
							</Link>

							{user ? (
								<>
									<Link
										href="/creator/create"
										className="text-gray-500 hover:text-gray-900"
										onClick={() => setIsMenuOpen(false)}
									>
										Create Game
									</Link>
									<button
										onClick={() => {
											handleLogout();
											setIsMenuOpen(false);
										}}
										className="text-gray-500 hover:text-gray-900 text-left"
									>
										Sign Out
									</button>
								</>
							) : (
								<>
									<Link
										href="/auth/login"
										className="text-gray-500 hover:text-gray-900"
										onClick={() => setIsMenuOpen(false)}
									>
										Sign In
									</Link>
									<Link
										href="/auth/signup"
										className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
										onClick={() => setIsMenuOpen(false)}
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}

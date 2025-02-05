//src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
	Crown,
	LogOut,
	Plus,
	User,
	ChevronDown,
	Trophy,
	Gamepad2,
} from "lucide-react";

export default function Header() {
	const { user, logout } = useAuth();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<header className="relative bg-gray-900">
			{/* Gradient Line Top */}
			<div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-500/50 via-emerald-500/50 to-purple-500/50" />

			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between h-16 px-4">
					{/* Logo Section */}
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="flex items-center gap-2 group"
						>
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-emerald-500 rounded blur group-hover:blur-md transition-all duration-300" />
								<div className="relative bg-gray-900 text-white font-bold text-2xl px-3 py-1 rounded border border-gray-800">
									H
								</div>
							</div>
							<span className="font-bold text-white">hudle</span>
						</Link>

						{/* Main Nav */}
						<nav className="hidden md:flex items-center gap-6">
							<Link
								href="/trending"
								className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors duration-200 group"
							>
								<Trophy className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
								<span>Trending</span>
							</Link>
							<Link
								href="/categories"
								className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors duration-200 group"
							>
								<Gamepad2 className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
								<span>Categories</span>
							</Link>
						</nav>
					</div>

					{/* Right Section */}
					<div className="flex items-center gap-3">
						{user ? (
							<>
								{/* Create Button */}
								<Link
									href="/creator/create"
									className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
								>
									<Plus className="w-4 h-4" />
									Create
								</Link>

								{/* User Menu */}
								<div className="relative">
									<button
										onClick={() =>
											setIsUserMenuOpen(!isUserMenuOpen)
										}
										className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
									>
										<div className="relative group">
											<div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-emerald-500/20 to-purple-500/20 rounded-full blur-sm" />
											<div className="relative w-8 h-8 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center">
												<User className="w-4 h-4 text-gray-400" />
											</div>
										</div>
										<ChevronDown className="w-4 h-4 text-gray-400" />
									</button>

									{isUserMenuOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg border-2 border-gray-800 shadow-xl py-2 z-50">
											<div className="px-4 py-2 border-b border-gray-800">
												<p className="text-white font-medium truncate">
													{user.email}
												</p>
											</div>

											<Link
												href="/dashboard"
												className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
											>
												<Crown className="w-4 h-4" />
												<span>My Games</span>
											</Link>

											<div className="border-t border-gray-800 my-1" />

											<button
												onClick={handleLogout}
												className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors duration-200"
											>
												<LogOut className="w-4 h-4" />
												<span>Sign Out</span>
											</button>
										</div>
									)}
								</div>
							</>
						) : (
							<div className="flex items-center gap-2">
								<Link
									href="/auth/login"
									className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
								>
									Sign In
								</Link>
								<Link
									href="/auth/signup"
									className="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Gradient Line Bottom */}
			<div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-500/50 via-emerald-500/50 to-purple-500/50" />
		</header>
	);
}

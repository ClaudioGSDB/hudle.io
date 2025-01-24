//src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPublicGames } from "@/services/game";
import { Game } from "@/types/game";
import Link from "next/link";

export default function HomePage() {
	const { user } = useAuth();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadGames() {
			try {
				const publicGames = await getPublicGames(10);
				setGames(publicGames);
			} catch (error) {
				console.error("Error loading games:", error);
			} finally {
				setLoading(false);
			}
		}

		loadGames();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gray-900 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
					<h1 className="text-4xl font-bold mb-4">
						Welcome to Hudle.io
					</h1>
					<p className="text-xl text-gray-300 mb-8">
						Create and play custom Wordle-like games
					</p>
					{user ? (
						<Link
							href="/creator/create"
							className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
						>
							Create Your Game
						</Link>
					) : (
						<Link
							href="/auth/login"
							className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
						>
							Get Started
						</Link>
					)}
				</div>
			</div>

			{/* Games Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h2 className="text-2xl font-bold mb-6">Featured Games</h2>

				{loading ? (
					<div className="flex justify-center items-center min-h-[200px]">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
					</div>
				) : games.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{games.map((game) => (
							<Link
								key={game.id}
								href={`/play/${game.id}`}
								className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="p-6">
									<h3 className="text-xl font-semibold mb-2">
										{game.title}
									</h3>
									<p className="text-gray-600 mb-4">
										{game.description}
									</p>

									<div className="flex flex-wrap gap-2">
										{game.tags.map((tag, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
											>
												{tag}
											</span>
										))}
									</div>

									{game.settings.isDailyChallenge && (
										<div className="mt-4 text-green-600 text-sm">
											Daily Challenge Available!
										</div>
									)}
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center text-gray-500 py-12">
						No games available yet. Be the first to create one!
					</div>
				)}
			</div>
		</div>
	);
}

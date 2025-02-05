//src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPublicGames } from "@/services/game";
import { Game } from "@/types/game";
import Link from "next/link";
import { Search, Trophy, Users, Star, Sparkles } from "lucide-react";
import GameCard from "@/components/game/GameCard";

export default function HomePage() {
	const { user } = useAuth();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [displayedGames, setDisplayedGames] = useState<Game[]>([]);

	// Load games
	useEffect(() => {
		const loadGames = async () => {
			try {
				const publicGames = await getPublicGames(20);
				setGames(publicGames);
				setDisplayedGames(publicGames);
			} catch (error) {
				console.error("Error loading games:", error);
			} finally {
				setLoading(false);
			}
		};

		loadGames();
	}, []);

	// Filter games based on search
	useEffect(() => {
		const filtered = games.filter((game) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				game.title.toLowerCase().includes(searchLower) ||
				game.description.toLowerCase().includes(searchLower) ||
				game.tags.some((tag) => tag.toLowerCase().includes(searchLower))
			);
		});
		setDisplayedGames(filtered);
	}, [searchQuery, games]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900">
			{/* Hero Section - removed hover effects from title */}
			<section className="border-b-2 border-gray-800">
				<div className="max-w-7xl mx-auto px-4 py-16">
					<div className="max-w-3xl mx-auto text-center mb-8">
						<div className="relative inline-flex items-center gap-2 mb-2">
							<Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
							<span className="text-emerald-400 font-medium">
								Welcome to
							</span>
							<Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
						</div>

						<h1 className="text-5xl font-bold mb-4">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 animate-gradient-x">
								Hudle
							</span>
						</h1>

						<p className="text-gray-400 text-lg mb-8">
							Play and create daily challenges about anything you
							love. <br />
							From Pokémon stats to movie quotes! 🎮
						</p>

						{/* Search Bar - kept hover effect */}
						<div className="relative group max-w-xl mx-auto">
							<div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 via-emerald-500/50 to-purple-500/50 rounded-lg opacity-0 group-hover:opacity-100 blur transition duration-500" />
							<div className="relative bg-gray-900 rounded-lg p-[1px]">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
										placeholder="Search games..."
										className="w-full bg-gray-800/50 rounded-lg py-3 pl-10 pr-4 text-gray-300 placeholder-gray-500 focus:outline-none border border-gray-700 focus:border-emerald-500/50"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Games Grid Section - using new GameCard component */}
			<section className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-xl font-bold text-white flex items-center gap-2">
						<Trophy className="w-5 h-5 text-emerald-400" />
						Popular Games
					</h2>
					{user && (
						<Link
							href="/creator/create"
							className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-750 transition-colors duration-200"
						>
							Create Game
						</Link>
					)}
				</div>

				{displayedGames.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{displayedGames.map((game) => (
							<GameCard key={game.id} game={game} />
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-gray-400 text-lg">
							{searchQuery
								? "No games found matching your search."
								: "No games available yet."}
						</p>
					</div>
				)}

				{displayedGames.length >= 20 && (
					<div className="text-center mt-8">
						<button
							onClick={() => {
								/* Implement load more logic */
							}}
							className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-750 transition-colors duration-200"
						>
							Load More Games
						</button>
					</div>
				)}
			</section>
		</div>
	);
}

// Helper functions
function getGameEmoji(type: string): string {
	const emojiMap: Record<string, string> = {
		attribute_guesser: "🎯",
		image_guesser: "🖼️",
		quote_guesser: "💭",
		progressive: "📈",
	};
	return emojiMap[type] || "🎮";
}

function getRandomPlays(): string {
	const num = Math.floor(Math.random() * 10000);
	return num > 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
}

function getRandomRating(): string {
	return (4 + Math.random()).toFixed(1);
}

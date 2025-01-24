//src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPublicGames } from "@/services/game";
import { Game } from "@/types/game";
import Link from "next/link";
import SearchBar from "@/components/home/SearchBar";
import CategoryFilter from "@/components/home/CategoryFilter";
import GameGrid from "@/components/home/GameGrid";

export default function HomePage() {
	const { user } = useAuth();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		null
	);

	useEffect(() => {
		loadGames();
	}, []);

	const loadGames = async () => {
		try {
			const publicGames = await getPublicGames(20);
			setGames(publicGames);
		} catch (error) {
			console.error("Error loading games:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredGames = games.filter((game) => {
		const matchesSearch =
			searchQuery.trim() === "" ||
			game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			game.description
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			game.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase())
			);

		const matchesCategory =
			!selectedCategory || game.tags.includes(selectedCategory);

		return matchesSearch && matchesCategory;
	});

	const featuredGames = games.filter(
		(game) => game.settings.isDailyChallenge
	);

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

			{/* Search and Filter Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row gap-4 mb-8">
					<div className="flex-1">
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
						/>
					</div>
					<CategoryFilter
						selected={selectedCategory}
						onSelect={setSelectedCategory}
					/>
				</div>

				{/* Featured Games */}
				{featuredGames.length > 0 && (
					<div className="mb-12">
						<h2 className="text-2xl font-bold mb-6">
							Daily Challenges
						</h2>
						<GameGrid games={featuredGames} />
					</div>
				)}

				{/* All Games */}
				<div>
					<h2 className="text-2xl font-bold mb-6">Browse Games</h2>
					{loading ? (
						<div className="flex justify-center items-center min-h-[200px]">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
						</div>
					) : filteredGames.length > 0 ? (
						<GameGrid games={filteredGames} />
					) : (
						<div className="text-center text-gray-500 py-12">
							No games found matching your criteria
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

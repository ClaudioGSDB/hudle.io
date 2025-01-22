"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Game } from "@/types/game";
import Link from "next/link";
import { getCreatorGames } from "@/services/game";

export default function DashboardPage() {
	const { user } = useAuth();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadGames = async () => {
			if (!user) return;
			try {
				const userGames = await getCreatorGames(user.uid);
				setGames(userGames);
			} catch (err) {
				setError("Failed to load games");
			} finally {
				setLoading(false);
			}
		};

		loadGames();
	}, [user]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">My Games</h1>
					<Link
						href="/creator/create"
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Create New Game
					</Link>
				</div>

				{error && (
					<div className="bg-red-50 text-red-500 p-4 rounded mb-6">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{games.map((game) => (
						<div
							key={game.id}
							className="bg-white rounded-lg shadow p-6"
						>
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-xl font-semibold">
										{game.title}
									</h3>
									<p className="text-gray-500 mt-1">
										{game.type}
									</p>
								</div>
								<span
									className={`px-2 py-1 rounded text-sm ${
										game.isPublished
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{game.isPublished ? "Published" : "Draft"}
								</span>
							</div>

							<p className="mt-2 text-gray-600 line-clamp-2">
								{game.description}
							</p>

							<div className="mt-4 flex flex-wrap gap-2">
								{game.tags.map((tag, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-gray-100 rounded-full text-sm"
									>
										{tag}
									</span>
								))}
							</div>

							<div className="mt-6 flex gap-3">
								{game.isPublished ? (
									<Link
										href={`/play/${game.id}`}
										className="flex-1 text-center py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
									>
										Play
									</Link>
								) : (
									<Link
										href={`/creator/game/${game.id}/setup`}
										className="flex-1 text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
									>
										Continue Setup
									</Link>
								)}
								<Link
									href={`/creator/game/${game.id}/edit`}
									className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
								>
									Edit
								</Link>
							</div>
						</div>
					))}
				</div>

				{games.length === 0 && !error && (
					<div className="text-center py-12">
						<p className="text-gray-500">
							You haven't created any games yet.
						</p>
						<Link
							href="/creator/create"
							className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Create Your First Game
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

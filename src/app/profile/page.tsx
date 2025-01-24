//src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Game } from "@/types/game";
import { getCreatorGames } from "@/services/game";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
	const { user } = useAuth();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalGames: 0,
		publishedGames: 0,
		totalPlays: 0,
	});

	useEffect(() => {
		const loadGames = async () => {
			if (!user) return;
			try {
				const userGames = await getCreatorGames(user.uid);
				setGames(userGames);
				setStats({
					totalGames: userGames.length,
					publishedGames: userGames.filter((game) => game.isPublished)
						.length,
					totalPlays: 0, // TODO: Implement play tracking
				});
			} catch (error) {
				console.error("Error loading games:", error);
			} finally {
				setLoading(false);
			}
		};

		loadGames();
	}, [user]);

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow overflow-hidden">
						{/* Profile Header */}
						<div className="p-6 sm:p-8 bg-blue-600 text-white">
							<h1 className="text-3xl font-bold">
								{user?.email}
							</h1>
							<p className="mt-2 text-blue-100">
								Member since{" "}
								{new Date(
									user?.metadata?.creationTime || ""
								).toLocaleDateString()}
							</p>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-3 border-b">
							<div className="p-6 text-center">
								<div className="text-2xl font-bold">
									{stats.totalGames}
								</div>
								<div className="text-sm text-gray-500">
									Total Games
								</div>
							</div>
							<div className="p-6 text-center border-l border-r">
								<div className="text-2xl font-bold">
									{stats.publishedGames}
								</div>
								<div className="text-sm text-gray-500">
									Published Games
								</div>
							</div>
							<div className="p-6 text-center">
								<div className="text-2xl font-bold">
									{stats.totalPlays}
								</div>
								<div className="text-sm text-gray-500">
									Total Plays
								</div>
							</div>
						</div>

						{/* Recent Games */}
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-4">
								Your Games
							</h2>
							{loading ? (
								<div className="text-center py-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
								</div>
							) : games.length > 0 ? (
								<div className="space-y-4">
									{games.map((game) => (
										<div
											key={game.id}
											className="flex items-center justify-between p-4 border rounded"
										>
											<div>
												<h3 className="font-medium">
													{game.title}
												</h3>
												<p className="text-sm text-gray-500">
													{game.type}
												</p>
											</div>
											<div className="flex items-center space-x-2">
												{game.isPublished ? (
													<Link
														href={`/play/${game.id}`}
														className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
													>
														Play
													</Link>
												) : (
													<Link
														href={`/creator/game/${game.id}/setup`}
														className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
													>
														Complete Setup
													</Link>
												)}
												<Link
													href={`/creator/game/${game.id}/edit`}
													className="px-3 py-1 border rounded hover:bg-gray-50"
												>
													Edit
												</Link>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">
										You haven't created any games yet.
									</p>
									<Link
										href="/creator/create"
										className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
									>
										Create Your First Game
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}

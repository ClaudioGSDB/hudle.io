//src/app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Game } from "@/types/game";
import { getCreatorGames } from "@/services/game";
import { getUserGameHistory } from "@/services/gamesPlayed";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getUserStats } from "@/services/userStats";

interface GamePlay {
	id: string;
	gameId: string;
	startedAt: string;
	completedAt?: string;
	status: string;
	attempts: number;
	won: boolean;
	timeSpent: number;
	game?: {
		title: string;
		type: string;
	};
}

export default function ProfilePage() {
	const { user } = useAuth();
	const [games, setGames] = useState<Game[]>([]);
	const [history, setHistory] = useState<GamePlay[]>([]);
	const [loading, setLoading] = useState(true);
	const [userStats, setUserStats] = useState<any>(null);

	useEffect(() => {
		const loadData = async () => {
			if (!user) return;
			try {
				// Load created games
				const userGames = await getCreatorGames(user.uid);
				setGames(userGames);

				// Load game history
				const plays = await getUserGameHistory(user.uid);
				setHistory(plays as GamePlay[]);

				// Load user stats
				const stats = await getUserStats(user.uid);
				setUserStats(stats);
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [user]);

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					{/* Profile Header with Stats */}
					<div className="bg-white rounded-lg shadow overflow-hidden mb-8">
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
						<div className="grid grid-cols-4 border-b">
							<div className="p-6 text-center">
								<div className="text-2xl font-bold">
									{userStats?.totalGamesPlayed || 0}
								</div>
								<div className="text-sm text-gray-500">
									Games Played
								</div>
							</div>
							<div className="p-6 text-center border-l">
								<div className="text-2xl font-bold">
									{userStats?.dailyStreak || 0}
								</div>
								<div className="text-sm text-gray-500">
									Current Streak
								</div>
							</div>
							<div className="p-6 text-center border-l">
								<div className="text-2xl font-bold">
									{userStats?.achievements?.maxStreak || 0}
								</div>
								<div className="text-sm text-gray-500">
									Best Streak
								</div>
							</div>
							<div className="p-6 text-center border-l">
								<div className="text-2xl font-bold">
									{userStats?.achievements?.perfectGames || 0}
								</div>
								<div className="text-sm text-gray-500">
									Perfect Games
								</div>
							</div>
						</div>

						{/* Achievements Section */}
						<div className="p-6">
							<h2 className="text-lg font-semibold mb-4">
								Achievements
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div
									className={`p-4 rounded-lg border ${
										userStats?.achievements?.firstWin
											? "bg-green-50 border-green-200"
											: "bg-gray-50 border-gray-200"
									}`}
								>
									<div className="font-medium">First Win</div>
									<div className="text-sm text-gray-600">
										Win your first game
									</div>
								</div>
								<div
									className={`p-4 rounded-lg border ${
										userStats?.achievements?.perfectGames
											? "bg-green-50 border-green-200"
											: "bg-gray-50 border-gray-200"
									}`}
								>
									<div className="font-medium">
										Perfect Game
									</div>
									<div className="text-sm text-gray-600">
										Win a game in one try
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Game-specific Stats */}
					{userStats?.gameStats &&
						Object.keys(userStats.gameStats).length > 0 && (
							<div className="bg-white rounded-lg shadow mb-8">
								<div className="p-6">
									<h2 className="text-lg font-semibold mb-4">
										Game Statistics
									</h2>
									<div className="overflow-x-auto">
										<table className="min-w-full">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Game
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Games Played
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Games Won
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Win %
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Avg. Attempts
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{Object.entries(
													userStats.gameStats
												).map(
													([gameId, stats]: [
														string,
														any
													]) => (
														<tr key={gameId}>
															<td className="px-6 py-4 whitespace-nowrap">
																{gameId}
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																{stats.played}
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																{stats.won}
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																{(
																	(stats.won /
																		stats.played) *
																	100
																).toFixed(1)}
																%
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																{stats.avgAttempts.toFixed(
																	1
																)}
															</td>
														</tr>
													)
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}

					{/* Created Games Section */}
					<div className="bg-white rounded-lg shadow mb-8">
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-4">
								Your Created Games
							</h2>
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
											<Link
												href={`/play/${game.id}`}
												className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
											>
												Play
											</Link>
											<Link
												href={`/creator/game/${game.id}/edit`}
												className="px-3 py-1 border rounded hover:bg-gray-50"
											>
												Edit
											</Link>
										</div>
									</div>
								))}
								{games.length === 0 && (
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

					{/* Game History Section */}
					<div className="bg-white rounded-lg shadow">
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-4">
								Game History
							</h2>
							{history.length > 0 ? (
								<div className="overflow-x-auto">
									<table className="min-w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Game
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Date
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Result
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Attempts
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Time
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{history.map((play) => (
												<tr key={play.id}>
													<td className="px-6 py-4 whitespace-nowrap">
														<Link
															href={`/play/${play.gameId}`}
															className="text-blue-600 hover:text-blue-800"
														>
															{play.game?.title ||
																"Unknown Game"}
														</Link>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{new Date(
															play.startedAt
														).toLocaleDateString()}
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														{play.status ===
														"completed" ? (
															<span
																className={`px-2 py-1 rounded-full text-xs font-medium ${
																	play.won
																		? "bg-green-100 text-green-800"
																		: "bg-red-100 text-red-800"
																}`}
															>
																{play.won
																	? "Won"
																	: "Lost"}
															</span>
														) : (
															<span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
																In Progress
															</span>
														)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{play.attempts || "-"}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{play.timeSpent
															? formatDuration(
																	play.timeSpent
															  )
															: "-"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No games played yet.
									</p>
									<Link
										href="/"
										className="mt-4 inline-block text-blue-600 hover:text-blue-800"
									>
										Find a game to play
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

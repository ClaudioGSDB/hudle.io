//src/components/game/stats/GameStats.tsx
"use client";

import { useEffect, useState } from "react";
import { getGameStats } from "@/services/gamesPlayed";
import AttemptDistribution from "./AttemptDistribution";

interface GameStatsProps {
	gameId: string;
}

export default function GameStats({ gameId }: GameStatsProps) {
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const gameStats = await getGameStats(gameId);
				setStats(gameStats);
			} catch (error) {
				console.error("Error loading game stats:", error);
			} finally {
				setLoading(false);
			}
		};

		loadStats();
	}, [gameId]);

	if (loading) {
		return <div className="animate-pulse">Loading stats...</div>;
	}

	return (
		<div className="bg-white rounded-lg shadow p-4">
			<h2 className="text-lg font-semibold mb-4">Game Statistics</h2>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="text-center p-3 bg-gray-50 rounded">
					<div className="text-2xl font-bold text-blue-600">
						{stats.totalPlays}
					</div>
					<div className="text-sm text-gray-600">Total Plays</div>
				</div>
				<div className="text-center p-3 bg-gray-50 rounded">
					<div className="text-2xl font-bold text-green-600">
						{stats.winRate.toFixed(1)}%
					</div>
					<div className="text-sm text-gray-600">Win Rate</div>
				</div>
				<div className="text-center p-3 bg-gray-50 rounded">
					<div className="text-2xl font-bold text-purple-600">
						{stats.averageAttempts.toFixed(1)}
					</div>
					<div className="text-sm text-gray-600">Avg Attempts</div>
				</div>
				<div className="text-center p-3 bg-gray-50 rounded">
					<div className="text-2xl font-bold text-orange-600">
						{stats.completedPlays}
					</div>
					<div className="text-sm text-gray-600">Completed</div>
				</div>
			</div>

			<AttemptDistribution
				distribution={stats.guessDistribution || {}}
				maxAttempts={6}
			/>
		</div>
	);
}

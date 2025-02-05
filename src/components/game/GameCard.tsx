//src/components/game/GameCard.tsx
import { useEffect, useState } from "react";
import { Game } from "@/types/game";
import { getGameStats } from "@/services/gamesPlayed";
import Link from "next/link";
import { Users } from "lucide-react";

interface GameCardProps {
	game: Game;
}

export default function GameCard({ game }: GameCardProps) {
	const [completedPlays, setCompletedPlays] = useState<number>(0);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const gameStats = await getGameStats(game.id);
				setCompletedPlays(gameStats?.completedPlays || 0);
			} catch (err) {
				console.error("Error loading game stats:", err);
				setCompletedPlays(0);
			}
		};
		loadStats();
	}, [game.id]);

	const formatNumber = (num: number): string => {
		if (!num) return "0";
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	const getGameEmoji = (type: string): string => {
		const emojiMap: Record<string, string> = {
			attribute_guesser: "🎯",
			image_guesser: "🖼️",
			quote_guesser: "💭",
			progressive: "📈",
		};
		return emojiMap[type] || "🎮";
	};

	return (
		<div className="h-[240px] bg-gray-900 border-2 border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-emerald-500/50">
			<div className="p-4 h-full flex flex-col">
				<h3 className="text-lg font-bold text-white mb-1 truncate">
					{game.title} {getGameEmoji(game.type)}
				</h3>

				<p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-none">
					{game.description}
				</p>

				<div className="h-6 flex flex-wrap gap-1 mb-3 overflow-hidden">
					{game.tags.slice(0, 2).map((tag) => (
						<span
							key={tag}
							className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 text-xs"
						>
							#{tag}
						</span>
					))}
				</div>

				<div className="mt-auto">
					<div className="flex items-center mb-3">
						<div className="flex items-center gap-1">
							<Users className="w-4 h-4 text-purple-400" />
							<span className="text-gray-400 text-sm">
								{formatNumber(completedPlays)}
							</span>
						</div>
					</div>

					<Link
						href={`/play/${game.id}`}
						className="block w-full px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium text-center transition-all duration-200 relative group"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						<span className="relative">Play Now</span>
					</Link>
				</div>
			</div>
		</div>
	);
}

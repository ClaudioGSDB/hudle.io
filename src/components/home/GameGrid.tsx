//src/components/home/GameGrid.tsx
import Link from "next/link";
import { Game } from "@/types/game";
import { CalendarIcon, TagIcon } from "@heroicons/react/24/outline";

interface GameGridProps {
	games: Game[];
}

export default function GameGrid({ games }: GameGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{games.map((game) => (
				<Link
					key={game.id}
					href={`/play/${game.id}`}
					className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
				>
					<div className="p-6">
						<div className="flex justify-between items-start">
							<h3 className="text-xl font-semibold text-gray-900">
								{game.title}
							</h3>
						</div>

						<p className="mt-2 text-gray-600 line-clamp-2">
							{game.description}
						</p>

						{game.tags.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2">
								{game.tags.map((tag, index) => (
									<span
										key={index}
										className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
									>
										<TagIcon className="h-3 w-3 mr-1" />
										{tag}
									</span>
								))}
							</div>
						)}

						<div className="mt-4 flex items-center text-sm text-gray-500">
							<span className="capitalize">
								{game.type.replace("_", " ")}
							</span>
							<span className="mx-2">•</span>
							<span>{getPlayCount(game)} plays</span>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}

// Temporary function until we implement play tracking
function getPlayCount(game: Game): number {
	return Math.floor(Math.random() * 1000);
}

//src/app/play/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Game } from "@/types/game";
import { getGame } from "@/services/game";
import AttributeGuesserPlay from "@/components/game/play/AttributeGuesserPlay";
import ImageGuesserPlay from "@/components/game/play/ImageGuesserPlay";
import QuoteGuesserPlay from "@/components/game/play/QuoteGuesserPlay";
import ProgressivePlay from "@/components/game/play/ProgressivePlay";

export default function GamePlayPage() {
	const params = useParams();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadGame = async () => {
			try {
				const gameData = await getGame(params.id as string);
				if (!gameData) throw new Error("Game not found");
				setGame(gameData);
			} catch (err) {
				setError("Failed to load game");
			} finally {
				setLoading(false);
			}
		};

		loadGame();
	}, [params.id]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (error || !game) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-red-500">{error || "Game not found"}</div>
			</div>
		);
	}

	const GameComponent = {
		attribute_guesser: AttributeGuesserPlay,
		image_guesser: ImageGuesserPlay,
		quote_guesser: QuoteGuesserPlay,
		progressive: ProgressivePlay,
	}[game.type];

	if (!GameComponent) {
		return <div>Unsupported game type</div>;
	}

	return <GameComponent game={game} />;
}

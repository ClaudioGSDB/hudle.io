"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getGame } from "@/services/game";
import { Game } from "@/types/game";
import AttributeGuesserSetup from "@/components/game/creator/setup/AttributeGuesserSetup";
import ImageGuesserSetup from "@/components/game/creator/setup/ImageGuesserSetup";
import QuoteGuesserSetup from "@/components/game/creator/setup/QuoteGuesserSetup";
import ProgressiveSetup from "@/components/game/creator/setup/ProgressiveSetup";

export default function GameSetupPage() {
	const params = useParams();
	const router = useRouter();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadGame = async () => {
			try {
				if (!params.id) {
					throw new Error("No game ID provided");
				}

				const gameData = await getGame(params.id as string);
				if (!gameData) {
					throw new Error("Game not found");
				}
				setGame(gameData as Game);
			} catch (err) {
				console.error("Failed to load game:", err);
				setError(
					err instanceof Error ? err.message : "Failed to load game"
				);
				// Redirect to create page after a delay if there's an error
				setTimeout(() => {
					router.push("/creator/create");
				}, 3000);
			} finally {
				setLoading(false);
			}
		};

		loadGame();
	}, [params.id, router]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading game setup...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 mb-4">{error}</div>
					<p className="text-gray-600">
						Redirecting to game creation...
					</p>
				</div>
			</div>
		);
	}

	if (!game) {
		return null;
	}

	const SetupComponent =
		{
			attribute_guesser: AttributeGuesserSetup,
			image_guesser: ImageGuesserSetup,
			quote_guesser: QuoteGuesserSetup,
			progressive: ProgressiveSetup,
		}[game.type] || AttributeGuesserSetup;

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h1 className="text-3xl font-bold">{game.title}</h1>
						<p className="mt-2 text-gray-600">
							Set up your game content and answers
						</p>
					</div>

					<SetupComponent game={game} setGame={setGame} />
				</div>
			</div>
		</ProtectedRoute>
	);
}

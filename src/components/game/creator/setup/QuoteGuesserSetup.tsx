"use client";

import { useState } from "react";
import { Game, GameAnswer } from "@/types/game";
import { updateGame, addGameAnswer } from "@/services/game";

interface QuoteGuesserSetupProps {
	game: Game;
	setGame: (game: Game) => void;
}

export default function QuoteGuesserSetup({
	game,
	setGame,
}: QuoteGuesserSetupProps) {
	const [currentAnswer, setCurrentAnswer] = useState<Partial<GameAnswer>>({
		answer: "",
		contents: {},
	});
	const [quote, setQuote] = useState("");
	const [hint, setHint] = useState("");
	const [error, setError] = useState("");

	const handleAddAnswer = async () => {
		if (!currentAnswer.answer || !quote) {
			setError("Both answer and quote are required");
			return;
		}

		try {
			const contentId = `content_${Date.now()}`;
			const answerData: Partial<GameAnswer> = {
				answer: currentAnswer.answer,
				contents: {
					[contentId]: {
						value: quote,
					},
				},
				hint: hint || undefined,
			};

			await addGameAnswer(game.id, answerData as GameAnswer);

			// Reset form
			setCurrentAnswer({
				answer: "",
				contents: {},
			});
			setQuote("");
			setHint("");
			setError("");
		} catch (err) {
			setError("Failed to add answer");
			console.error(err);
		}
	};

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Add Quote Answer</h2>

				<div className="space-y-4">
					{/* Quote Input */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Quote
						</label>
						<textarea
							value={quote}
							onChange={(e) => setQuote(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							rows={4}
							placeholder="Enter the quote..."
							required
						/>
					</div>

					{/* Answer Input */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Who Said It? (Answer)
						</label>
						<input
							type="text"
							value={currentAnswer.answer as string}
							onChange={(e) =>
								setCurrentAnswer((prev) => ({
									...prev,
									answer: e.target.value,
								}))
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="e.g., Character Name"
							required
						/>
					</div>

					{/* Hint Input */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Hint (Optional)
						</label>
						<input
							type="text"
							value={hint}
							onChange={(e) => setHint(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="e.g., From Season 1"
						/>
					</div>

					{/* Error Display */}
					{error && (
						<div className="text-red-500 text-sm">{error}</div>
					)}

					{/* Submit Button */}
					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Answer
					</button>
				</div>
			</div>
		</div>
	);
}

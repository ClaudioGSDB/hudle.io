"use client";

import { useState, useEffect } from "react";
import { Game, QuoteGameAnswer } from "@/types/game";
import { getGameAnswers } from "@/services/game";

interface QuoteGuesserPlayProps {
	game: Game;
}

export default function QuoteGuesserPlay({ game }: QuoteGuesserPlayProps) {
	const [answers, setAnswers] = useState<QuoteGameAnswer[]>([]);
	const [currentAnswer, setCurrentAnswer] = useState<QuoteGameAnswer | null>(
		null
	);
	const [guess, setGuess] = useState("");
	const [attempts, setAttempts] = useState<string[]>([]);
	const [showHint, setShowHint] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAnswers = async () => {
			try {
				const gameAnswers = await getGameAnswers(game.id);
				setAnswers(gameAnswers as QuoteGameAnswer[]);
				setCurrentAnswer(gameAnswers[0] as QuoteGameAnswer);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadAnswers();
	}, [game.id]);

	const handleGuess = () => {
		if (!guess.trim() || !currentAnswer) return;

		const isCorrect =
			guess.toLowerCase() === currentAnswer.answer.toLowerCase();
		const newAttempts = [...attempts, guess];
		setAttempts(newAttempts);
		setGuess("");

		if (!isCorrect && !showHint && currentAnswer.hint) {
			setShowHint(true);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (!currentAnswer) return <div>No quotes available</div>;

	const quoteContent = Object.values(currentAnswer.contents)[0];
	const hasWon = attempts.some(
		(attempt) =>
			attempt.toLowerCase() === currentAnswer.answer.toLowerCase()
	);

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">{game.title}</h1>

			<div className="space-y-6">
				<div className="bg-gray-100 p-6 rounded-lg italic text-lg">
					"{quoteContent.value}"
				</div>

				{showHint && currentAnswer.hint && (
					<div className="bg-blue-50 p-4 rounded-lg">
						<span className="font-semibold">Hint:</span>{" "}
						{currentAnswer.hint}
					</div>
				)}

				{!hasWon && (
					<div className="flex gap-2">
						<input
							type="text"
							value={guess}
							onChange={(e) => setGuess(e.target.value)}
							className="flex-1 px-4 py-2 border rounded"
							placeholder="Who said this?"
							onKeyDown={(e) =>
								e.key === "Enter" && handleGuess()
							}
						/>
						<button
							onClick={handleGuess}
							className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Guess
						</button>
					</div>
				)}

				{hasWon && (
					<div className="p-4 bg-green-100 rounded-lg">
						🎉 Correct! The quote was from {currentAnswer.answer}!
					</div>
				)}

				{attempts.length > 0 && (
					<div>
						<h3 className="font-semibold mb-2">
							Previous Guesses:
						</h3>
						<div className="space-y-1">
							{attempts.map((attempt, index) => (
								<div
									key={index}
									className={`p-2 rounded ${
										attempt.toLowerCase() ===
										currentAnswer.answer.toLowerCase()
											? "bg-green-100"
											: "bg-gray-100"
									}`}
								>
									{attempt}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

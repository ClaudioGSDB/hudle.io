//src/components/game/play/ProgressivePlay.tsx
"use client";

import { useState, useEffect } from "react";
import { Game, ProgressiveGameAnswer } from "@/types/game";
import { getGameAnswers } from "@/services/game";

interface ProgressivePlayProps {
	game: Game;
}

export default function ProgressivePlay({ game }: ProgressivePlayProps) {
	const [answers, setAnswers] = useState<ProgressiveGameAnswer[]>([]);
	const [currentAnswer, setCurrentAnswer] =
		useState<ProgressiveGameAnswer | null>(null);
	const [guess, setGuess] = useState("");
	const [attempts, setAttempts] = useState<string[]>([]);
	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAnswers = async () => {
			try {
				const gameAnswers = await getGameAnswers(game.id);
				setAnswers(gameAnswers as ProgressiveGameAnswer[]);
				setCurrentAnswer(gameAnswers[0] as ProgressiveGameAnswer);
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

		if (
			!isCorrect &&
			Object.values(currentAnswer.contents).length > currentStep
		) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (!currentAnswer) return <div>No content available</div>;

	const visibleContents = Object.entries(currentAnswer.contents)
		.filter(([_, content]) => content.revealOrder <= currentStep)
		.sort((a, b) => (a[1].revealOrder || 0) - (b[1].revealOrder || 0));

	const hasWon = attempts.some(
		(attempt) =>
			attempt.toLowerCase() === currentAnswer.answer.toLowerCase()
	);

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">{game.title}</h1>

			<div className="space-y-6">
				<div className="space-y-4">
					{visibleContents.map(([id, content]) => (
						<div key={id} className="bg-gray-100 p-4 rounded-lg">
							{content.value.startsWith("http") ? (
								<img
									src={content.value}
									alt="Clue"
									className="max-w-full rounded"
								/>
							) : (
								<p>{content.value}</p>
							)}
						</div>
					))}
				</div>

				{!hasWon && (
					<div className="flex gap-2">
						<input
							type="text"
							value={guess}
							onChange={(e) => setGuess(e.target.value)}
							className="flex-1 px-4 py-2 border rounded"
							placeholder="Enter your guess"
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
						🎉 Correct! The answer was {currentAnswer.answer}!
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

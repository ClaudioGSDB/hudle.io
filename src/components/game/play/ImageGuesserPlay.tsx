//src/components/game/play/ImageGuesserPlay.tsx
"use client";

import { useState, useEffect } from "react";
import { Game, ImageGameAnswer } from "@/types/game";
import { getGameAnswers } from "@/services/game";

interface ImageGuesserPlayProps {
	game: Game;
}

export default function ImageGuesserPlay({ game }: ImageGuesserPlayProps) {
	const [answers, setAnswers] = useState<ImageGameAnswer[]>([]);
	const [currentAnswer, setCurrentAnswer] = useState<ImageGameAnswer | null>(
		null
	);
	const [guess, setGuess] = useState("");
	const [attempts, setAttempts] = useState<string[]>([]);
	const [feedback, setFeedback] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAnswers = async () => {
			try {
				const gameAnswers = await getGameAnswers(game.id);
				setAnswers(gameAnswers as ImageGameAnswer[]);
				// For now, use first answer. Later implement daily rotation
				setCurrentAnswer(gameAnswers[0] as ImageGameAnswer);
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

		if (isCorrect) {
			setFeedback("Correct! You won! 🎉");
		} else {
			setFeedback("Wrong answer. Try again!");
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!currentAnswer) {
		return <div>No answers available</div>;
	}

	const imageContent = Object.values(currentAnswer.contents)[0];

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">{game.title}</h1>
			<div className="mb-8">
				<img
					src={imageContent.value}
					alt="Game Image"
					className="max-w-full rounded-lg shadow-lg"
				/>
			</div>

			<div className="space-y-4">
				<div className="flex gap-2">
					<input
						type="text"
						value={guess}
						onChange={(e) => setGuess(e.target.value)}
						className="flex-1 px-4 py-2 border rounded"
						placeholder="Enter your guess"
						onKeyDown={(e) => e.key === "Enter" && handleGuess()}
					/>
					<button
						onClick={handleGuess}
						className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Guess
					</button>
				</div>

				{feedback && (
					<div
						className={`p-4 rounded ${
							feedback.includes("Correct")
								? "bg-green-100"
								: "bg-red-100"
						}`}
					>
						{feedback}
					</div>
				)}

				<div>
					<h3 className="font-semibold mb-2">Previous Guesses:</h3>
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
			</div>
		</div>
	);
}

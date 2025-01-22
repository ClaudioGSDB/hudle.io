"use client";

import { useState, useEffect } from "react";
import { Game, AttributeGameAnswer } from "@/types/game";
import { getGameAnswers } from "@/services/game";

interface AttributeGuesserPlayProps {
	game: Game;
}

export default function AttributeGuesserPlay({
	game,
}: AttributeGuesserPlayProps) {
	const [answers, setAnswers] = useState<AttributeGameAnswer[]>([]);
	const [currentAnswer, setCurrentAnswer] =
		useState<AttributeGameAnswer | null>(null);
	const [guess, setGuess] = useState("");
	const [attempts, setAttempts] = useState<string[]>([]);
	const [attributeResults, setAttributeResults] = useState<
		Record<string, boolean>
	>({});
	const [loading, setLoading] = useState(true);
	const [won, setWon] = useState(false);

	useEffect(() => {
		const loadAnswers = async () => {
			try {
				const gameAnswers = await getGameAnswers(game.id);
				setAnswers(gameAnswers as AttributeGameAnswer[]);
				setCurrentAnswer(gameAnswers[0] as AttributeGameAnswer);
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
		setAttempts([...attempts, guess]);
		setGuess("");

		if (isCorrect) {
			setWon(true);
		} else {
			// Check attributes for partial matches
			const newAttributeResults = { ...attributeResults };
			game.attributes?.forEach((attr) => {
				const guessedAnswer = answers.find(
					(a) => a.answer.toLowerCase() === guess.toLowerCase()
				);
				if (guessedAnswer) {
					const isMatch =
						JSON.stringify(
							guessedAnswer.attributeValues[attr.id]
						) ===
						JSON.stringify(currentAnswer.attributeValues[attr.id]);
					newAttributeResults[attr.id] = isMatch;
				}
			});
			setAttributeResults(newAttributeResults);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (!currentAnswer || !game.attributes)
		return <div>No game data available</div>;

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">{game.title}</h1>

			<div className="space-y-4">
				{!won && (
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

				{won ? (
					<div className="p-4 bg-green-100 rounded">
						🎉 Correct! The answer was {currentAnswer.answer}!
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{game.attributes.map((attr) => {
							const lastGuess = answers.find(
								(a) =>
									a.answer.toLowerCase() ===
									attempts[attempts.length - 1]?.toLowerCase()
							);
							const showValue =
								lastGuess &&
								attributeResults[attr.id] !== undefined;

							return (
								<div
									key={attr.id}
									className={`p-4 rounded ${
										showValue
											? attributeResults[attr.id]
												? "bg-green-100"
												: "bg-red-100"
											: "bg-gray-100"
									}`}
								>
									<div className="font-semibold">
										{attr.name}
									</div>
									{showValue && (
										<div className="mt-1">
											{String(
												lastGuess.attributeValues[
													attr.id
												]
											)}
										</div>
									)}
								</div>
							);
						})}
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

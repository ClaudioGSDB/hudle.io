//src/components/game/play/AttributeGuesserPlay.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Game, AttributeGameAnswer } from "@/types/game";
import { getGameAnswers } from "@/services/game";

export default function AttributeGuesserPlay({ game }: { game: Game }) {
	const [answers, setAnswers] = useState<AttributeGameAnswer[]>([]);
	const [currentAnswer, setCurrentAnswer] =
		useState<AttributeGameAnswer | null>(null);
	const [guess, setGuess] = useState("");
	const [attempts, setAttempts] = useState<string[]>([]);
	const [attributeResults, setAttributeResults] = useState<
		Record<string, boolean>
	>({});
	const [filteredAnswers, setFilteredAnswers] = useState<string[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);

	const allPossibleAnswers = useMemo(
		() => answers.map((a) => a.answer.toLowerCase()),
		[answers]
	);

	useEffect(() => {
		const loadAnswers = async () => {
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as AttributeGameAnswer[]);
			setCurrentAnswer(gameAnswers[0] as AttributeGameAnswer);
		};
		loadAnswers();
	}, [game.id]);

	useEffect(() => {
		if (guess.trim()) {
			const filtered = allPossibleAnswers
				.filter((a) => a.includes(guess.toLowerCase()))
				.filter((a) => !attempts.includes(a));
			setFilteredAnswers(filtered);
			setShowDropdown(true);
		} else {
			setFilteredAnswers([]);
			setShowDropdown(false);
		}
	}, [guess, allPossibleAnswers, attempts]);

	const handleGuess = (guessValue: string) => {
		if (!currentAnswer || attempts.includes(guessValue)) return;

		const isCorrect =
			guessValue.toLowerCase() === currentAnswer.answer.toLowerCase();
		setAttempts((prev) => [...prev, guessValue]);
		setGuess("");
		setShowDropdown(false);

		if (isCorrect) {
			setAttributeResults({});
		} else {
			const guessedAnswer = answers.find(
				(a) => a.answer.toLowerCase() === guessValue.toLowerCase()
			);

			if (guessedAnswer) {
				const newResults = { ...attributeResults };
				game.attributes?.forEach((attr) => {
					newResults[attr.id] =
						JSON.stringify(
							guessedAnswer.attributeValues[attr.id]
						) ===
						JSON.stringify(currentAnswer.attributeValues[attr.id]);
				});
				setAttributeResults(newResults);
			}
		}
	};

	const getAttributeClass = (attrId: string) => {
		if (attributeResults[attrId] === undefined) return "bg-gray-100";
		return attributeResults[attrId] ? "bg-green-100" : "bg-red-100";
	};

	if (!currentAnswer || !game.attributes) return null;

	return (
		<div className="max-w-2xl mx-auto p-4">
			<div className="relative">
				<input
					type="text"
					value={guess}
					onChange={(e) => setGuess(e.target.value)}
					className="w-full px-4 py-2 border rounded"
					placeholder="Enter your guess"
				/>
				{showDropdown && filteredAnswers.length > 0 && (
					<div className="absolute w-full bg-white border rounded-b mt-1 max-h-60 overflow-y-auto z-10">
						{filteredAnswers.map((answer) => (
							<div
								key={answer}
								className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
								onClick={() => handleGuess(answer)}
							>
								{answer}
							</div>
						))}
					</div>
				)}
			</div>

			<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
				{game.attributes.map((attr) => (
					<div
						key={attr.id}
						className={`p-4 rounded ${getAttributeClass(attr.id)}`}
					>
						<div className="font-semibold">{attr.name}</div>
						{attributeResults[attr.id] !== undefined && (
							<div className="mt-1">
								{currentAnswer.attributeValues[
									attr.id
								]?.toString()}
							</div>
						)}
					</div>
				))}
			</div>

			<div className="mt-8">
				<h3 className="font-semibold mb-2">Previous Guesses:</h3>
				<div className="space-y-2">
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
	);
}

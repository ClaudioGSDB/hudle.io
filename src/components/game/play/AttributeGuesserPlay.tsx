//src/components/game/play/AttributeGuesserPlay.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Game, AttributeGameAnswer } from "@/types/game";
import { useAuth } from "@/context/AuthContext";
import { getGameAnswers } from "@/services/game";
import { getDailyAnswer } from "@/services/dailyChallenge";
import { updateDailyStats, getDailyStats } from "@/services/dailyStats";
import ShareResults from "@/components/game/ShareResults";

export default function AttributeGuesserPlay({ game }: { game: Game }) {
	const { user } = useAuth();
	const [currentAnswer, setCurrentAnswer] =
		useState<AttributeGameAnswer | null>(null);
	const [guess, setGuess] = useState("");
	const [attempts, setAttempts] = useState<string[]>([]);
	const [attributeResults, setAttributeResults] = useState<
		Record<string, boolean>
	>({});
	const [filteredAnswers, setFilteredAnswers] = useState<string[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [gameComplete, setGameComplete] = useState(false);
	const [stats, setStats] = useState<any>(null);

	const allPossibleAnswers = useMemo(() => {
		if (!currentAnswer) return [];
		return [currentAnswer.answer.toLowerCase()];
	}, [currentAnswer]);

	useEffect(() => {
		loadGame();
	}, [game.id]);

	const loadGame = async () => {
		if (game.settings.isDailyChallenge) {
			const dailyAnswer = await getDailyAnswer(game.id);
			setCurrentAnswer(dailyAnswer as AttributeGameAnswer);

			if (user) {
				const userStats = await getDailyStats(user.uid, game.id);
				setStats(userStats);
			}
		} else {
			const gameAnswers = await getGameAnswers(game.id);
			setCurrentAnswer(gameAnswers[0] as AttributeGameAnswer);
		}
	};

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

	const handleGuess = async (guessValue: string) => {
		if (!currentAnswer || attempts.includes(guessValue)) return;

		const isCorrect =
			guessValue.toLowerCase() === currentAnswer.answer.toLowerCase();
		setAttempts((prev) => [...prev, guessValue]);
		setGuess("");
		setShowDropdown(false);

		if (isCorrect) {
			setAttributeResults({});
			setGameComplete(true);
			if (user && game.settings.isDailyChallenge) {
				const updatedStats = await updateDailyStats(
					user.uid,
					game.id,
					true,
					attempts.length + 1
				);
				setStats(updatedStats);
			}
		} else {
			const guessedAnswer = {
				answer: guessValue,
				attributeValues: currentAnswer.attributeValues,
			};
			const newResults = { ...attributeResults };
			game.attributes?.forEach((attr) => {
				newResults[attr.id] =
					JSON.stringify(guessedAnswer.attributeValues[attr.id]) ===
					JSON.stringify(currentAnswer.attributeValues[attr.id]);
			});
			setAttributeResults(newResults);
		}
	};

	const getAttributeClass = (attrId: string) => {
		if (attributeResults[attrId] === undefined) return "bg-gray-100";
		return attributeResults[attrId] ? "bg-green-100" : "bg-red-100";
	};

	if (!currentAnswer || !game.attributes) return null;

	return (
		<div className="max-w-2xl mx-auto p-4">
			{game.settings.isDailyChallenge && stats && (
				<div className="mb-4 p-4 bg-blue-50 rounded-lg">
					<h3 className="font-semibold">Daily Challenge Stats</h3>
					<div className="mt-2 grid grid-cols-2 gap-4 text-sm">
						<div>Streak: {stats.currentStreak}</div>
						<div>Max Streak: {stats.maxStreak}</div>
						<div>Games Won: {stats.totalWins}</div>
						<div>Games Played: {stats.totalPlayed}</div>
					</div>
				</div>
			)}

			<div className="relative">
				<input
					type="text"
					value={guess}
					onChange={(e) => setGuess(e.target.value)}
					className="w-full px-4 py-2 border rounded"
					placeholder="Enter your guess"
					disabled={gameComplete}
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

			{gameComplete && (
				<div className="mt-8 p-4 bg-green-100 rounded-lg text-center">
					<h3 className="font-bold text-lg">Congratulations!</h3>
					<p>You solved it in {attempts.length} guesses.</p>
					{game.settings.isDailyChallenge && (
						<div className="mt-4">
							<ShareResults
								gameTitle={game.title}
								attempts={attempts.length}
								maxAttempts={game.maxAttempts || 6}
								attributeResults={attempts.map((attempt) => {
									const results: Record<string, boolean> = {};
									game.attributes?.forEach((attr) => {
										results[attr.id] =
											attempt.toLowerCase() ===
											currentAnswer?.answer.toLowerCase();
									});
									return results;
								})}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

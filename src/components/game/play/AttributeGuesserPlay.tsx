//src/components/game/play/AttributeGuesserPlay.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Game, AttributeGameAnswer } from "@/types/game";
import { useAuth } from "@/context/AuthContext";
import { getGameAnswers } from "@/services/game";
import { recordGameStart, recordGameEnd } from "@/services/gamesPlayed";
import { getDailyAnswer } from "@/services/dailyChallenge";
import { updateDailyStats, getDailyStats } from "@/services/dailyStats";
import ShareResults from "@/components/game/ShareResults";
import GameStats from "@/components/game/stats/GameStats";

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
	const [playId, setPlayId] = useState<string | null>(null);
	const [answers, setAnswers] = useState<AttributeGameAnswer[]>([]);

	const allPossibleAnswers = useMemo(() => {
		try {
			return answers.map((a) => a.answer.toLowerCase());
		} catch (error) {
			console.error("Error getting possible answers:", error);
			return [];
		}
	}, [answers]);

	useEffect(() => {
		loadGame();
		if (user) {
			recordGameStart(user.uid, game.id).then(setPlayId);
		}
	}, [game.id]);

	const loadGame = async () => {
		try {
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as AttributeGameAnswer[]);

			if (game.settings.isDailyChallenge) {
				const dailyAnswer = await getDailyAnswer(game.id);
				setCurrentAnswer(dailyAnswer as AttributeGameAnswer);

				if (user) {
					const userStats = await getDailyStats(user.uid, game.id);
					setStats(userStats);
				}
			} else {
				setCurrentAnswer(gameAnswers[0] as AttributeGameAnswer);
			}
		} catch (error) {
			console.error("Error loading game:", error);
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
			if (playId) {
				recordGameEnd(playId, {
					attempts: attempts.length + 1,
					won: true,
					timeSpent: Math.floor(
						(Date.now() - new Date(game.createdAt).getTime()) / 1000
					),
					guesses: [...attempts, guessValue],
				});
			}
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

			<div className="text-center mb-8">
				<h1 className="text-2xl font-bold mb-2">{game.title}</h1>
				<p className="text-gray-600 mb-6">{game.description}</p>
				<GameStats gameId={game.id} />
			</div>

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

			<div className="mt-8">
				<h3 className="font-semibold mb-4">Previous Guesses:</h3>
				<div className="flex mb-2">
					<div className="w-24"></div>
					<div className="flex-1 flex space-x-1">
						{game.attributes?.map((attr) => (
							<div
								key={attr.id}
								className="flex-1 text-sm text-center font-semibold"
							>
								{attr.name}
							</div>
						))}
					</div>
				</div>
				<div className="space-y-2">
					{attempts.map((attempt, index) => {
						const isCorrect =
							attempt.toLowerCase() ===
							currentAnswer.answer.toLowerCase();
						const guessAnswer = answers.find(
							(a) =>
								a.answer.toLowerCase() === attempt.toLowerCase()
						);

						return (
							<div
								key={index}
								className="flex items-center space-x-2"
							>
								<div className="w-24 font-medium">
									{attempt}
								</div>
								<div className="flex-1 flex space-x-1">
									{game.attributes?.map((attr) => {
										const guessValue =
											guessAnswer?.attributeValues[
												attr.id
											];
										const correctValue =
											currentAnswer.attributeValues[
												attr.id
											];
										const isAttrCorrect =
											JSON.stringify(guessValue) ===
											JSON.stringify(correctValue);

										return (
											<div
												key={attr.id}
												className={`flex-1 text-sm text-center p-2 rounded ${
													isAttrCorrect
														? "bg-green-600 text-white"
														: "bg-red-600 text-white"
												}`}
												title={attr.name}
											>
												{String(guessValue)}
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
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

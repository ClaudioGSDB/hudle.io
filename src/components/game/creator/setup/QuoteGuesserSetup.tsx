"use client";

import { useState, useEffect } from "react";
import { Game, QuoteGameAnswer } from "@/types/game";
import {
	createGameAnswer,
	getGameAnswers,
	deleteGameAnswer,
	updateGame,
} from "@/services/game";
import { useRouter } from "next/navigation";

interface QuoteGuesserSetupProps {
	game: Game;
	setGame: (game: Game) => void;
}

export default function QuoteGuesserSetup({
	game,
	setGame,
}: QuoteGuesserSetupProps) {
	const [currentAnswer, setCurrentAnswer] = useState<
		Partial<QuoteGameAnswer>
	>({
		answer: "",
		contents: {},
	});
	const [quote, setQuote] = useState("");
	const [hint, setHint] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [answers, setAnswers] = useState<QuoteGameAnswer[]>([]);
	const [loadingAnswers, setLoadingAnswers] = useState(true);
	const router = useRouter();

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			setLoadingAnswers(true);
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as QuoteGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoadingAnswers(false);
		}
	};

	const handleAddAnswer = async () => {
		if (!currentAnswer.answer || !quote) {
			setError("Both answer and quote are required");
			return;
		}

		try {
			const contentId = `content_${Date.now()}`;
			const answerData: Partial<QuoteGameAnswer> = {
				answer: currentAnswer.answer,
				contents: {
					[contentId]: {
						value: quote,
					},
				},
				hint: hint || undefined,
			};

			await createGameAnswer(game.id, "quote_guesser", answerData);
			await loadAnswers();

			setCurrentAnswer({ answer: "", contents: {} });
			setQuote("");
			setHint("");
			setSuccess("Answer added successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError("Failed to add answer");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		if (window.confirm("Are you sure you want to delete this answer?")) {
			try {
				await deleteGameAnswer(game.id, answerId);
				await loadAnswers();
				setSuccess("Answer deleted successfully!");
				setTimeout(() => setSuccess(""), 3000);
			} catch (err) {
				setError("Failed to delete answer");
			}
		}
	};

	const handleFinishSetup = async () => {
		if (answers.length === 0) {
			setError("Add at least one answer before publishing");
			return;
		}

		try {
			await updateGame(game.id, {
				...game,
				isPublished: true,
				updatedAt: new Date().toISOString(),
			});
			router.push("/dashboard");
		} catch (err) {
			setError("Failed to publish game");
			console.error(err);
		}
	};

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Add Quote Answer</h2>

				<div className="space-y-4">
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

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Who Said It? (Answer)
						</label>
						<input
							type="text"
							value={currentAnswer.answer}
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

					{error && (
						<div className="bg-red-50 text-red-500 p-3 rounded">
							{error}
						</div>
					)}

					{success && (
						<div className="bg-green-50 text-green-500 p-3 rounded">
							{success}
						</div>
					)}

					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Answer
					</button>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Current Answers</h2>

				{loadingAnswers ? (
					<div className="flex justify-center py-4">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
					</div>
				) : answers.length > 0 ? (
					<div className="space-y-6">
						{answers.map((answer) => (
							<div
								key={answer.id}
								className="border rounded-lg p-4 hover:bg-gray-50"
							>
								<div className="flex justify-between items-start mb-4">
									<h3 className="font-medium text-lg">
										{answer.answer}
									</h3>
									<button
										onClick={() =>
											handleDeleteAnswer(answer.id)
										}
										className="text-red-500 hover:text-red-700"
									>
										Delete
									</button>
								</div>

								<div className="space-y-2">
									{Object.entries(answer.contents).map(
										([contentId, content]) => (
											<div
												key={contentId}
												className="p-3 bg-gray-50 rounded italic"
											>
												"{content.value}"
											</div>
										)
									)}
									{answer.hint && (
										<div className="text-sm text-gray-600 mt-2">
											Hint: {answer.hint}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-4">
						No answers added yet.
					</p>
				)}
			</div>
			{/* Finish Setup Section */}
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Finish Setup</h2>
				<div className="space-y-4">
					<p className="text-gray-600">
						You have added {answers.length} answers to your game.
					</p>
					<button
						onClick={handleFinishSetup}
						className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
					>
						Publish Game
					</button>
				</div>
			</div>
		</div>
	);
}

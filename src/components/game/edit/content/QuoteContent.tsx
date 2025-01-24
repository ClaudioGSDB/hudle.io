//src/components/game/edit/content/QuoteContent.tsx
"use client";

import { useState, useEffect } from "react";
import { Game, QuoteGameAnswer } from "@/types/game";
import {
	getGameAnswers,
	createGameAnswer,
	deleteGameAnswer,
} from "@/services/game";

interface QuoteContentProps {
	game: Game;
	onUpdate: () => void;
}

export default function QuoteContent({ game, onUpdate }: QuoteContentProps) {
	const [answers, setAnswers] = useState<QuoteGameAnswer[]>([]);
	const [newQuote, setNewQuote] = useState("");
	const [newAnswer, setNewAnswer] = useState("");
	const [newHint, setNewHint] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as QuoteGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoading(false);
		}
	};

	const handleAddAnswer = async () => {
		if (!newQuote || !newAnswer) {
			setError("Both quote and answer are required");
			return;
		}

		try {
			const contentId = `content_${Date.now()}`;
			await createGameAnswer(game.id, "quote_guesser", {
				answer: newAnswer,
				contents: {
					[contentId]: {
						value: newQuote,
					},
				},
				hint: newHint || undefined,
			});

			await loadAnswers();
			setNewQuote("");
			setNewAnswer("");
			setNewHint("");
			onUpdate();
		} catch (err) {
			setError("Failed to add answer");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		if (!window.confirm("Are you sure you want to delete this answer?"))
			return;

		try {
			await deleteGameAnswer(game.id, answerId);
			await loadAnswers();
			onUpdate();
		} catch (err) {
			setError("Failed to delete answer");
		}
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Add New Quote</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Quote
						</label>
						<textarea
							value={newQuote}
							onChange={(e) => setNewQuote(e.target.value)}
							className="w-full px-3 py-2 border rounded-md"
							rows={4}
							placeholder="Enter the quote..."
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Answer (Who said it?)
						</label>
						<input
							type="text"
							value={newAnswer}
							onChange={(e) => setNewAnswer(e.target.value)}
							className="w-full px-3 py-2 border rounded-md"
							placeholder="Who said this quote?"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Hint (Optional)
						</label>
						<input
							type="text"
							value={newHint}
							onChange={(e) => setNewHint(e.target.value)}
							className="w-full px-3 py-2 border rounded-md"
							placeholder="Optional hint"
						/>
					</div>
					{error && <p className="text-red-500">{error}</p>}
					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Quote
					</button>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Current Quotes</h3>
				<div className="space-y-6">
					{answers.map((answer) => (
						<div key={answer.id} className="border rounded-lg p-4">
							<div className="flex justify-between items-start mb-4">
								<h4 className="font-medium">{answer.answer}</h4>
								<button
									onClick={() =>
										handleDeleteAnswer(answer.id)
									}
									className="text-red-500 hover:text-red-700"
								>
									Delete
								</button>
							</div>
							{Object.entries(answer.contents).map(
								([contentId, content]) => (
									<div
										key={contentId}
										className="bg-gray-50 p-4 rounded italic mb-2"
									>
										"{content.value}"
									</div>
								)
							)}
							{answer.hint && (
								<div className="text-sm text-gray-600">
									Hint: {answer.hint}
								</div>
							)}
						</div>
					))}
					{answers.length === 0 && (
						<p className="text-gray-500 text-center py-4">
							No quotes added yet
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

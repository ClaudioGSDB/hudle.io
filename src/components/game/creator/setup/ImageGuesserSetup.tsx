"use client";

import { useState, useEffect } from "react";
import { Game, ImageGameAnswer } from "@/types/game";
import {
	updateGame,
	addGameAnswer,
	getGameAnswers,
	deleteGameAnswer,
} from "@/services/game";

interface ImageGuesserSetupProps {
	game: Game;
	setGame: (game: Game) => void;
}

export default function ImageGuesserSetup({
	game,
	setGame,
}: ImageGuesserSetupProps) {
	const [currentAnswer, setCurrentAnswer] = useState<
		Partial<ImageGameAnswer>
	>({
		answer: "",
		contents: {},
	});
	const [imageUrl, setImageUrl] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [answers, setAnswers] = useState<ImageGameAnswer[]>([]);
	const [loadingAnswers, setLoadingAnswers] = useState(true);

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			setLoadingAnswers(true);
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoadingAnswers(false);
		}
	};

	const handleAddAnswer = async () => {
		if (!currentAnswer.answer || !imageUrl) {
			setError("Both answer and image are required");
			return;
		}

		try {
			setError("");
			const contentId = `content_${Date.now()}`;
			const answerData: Partial<GameAnswer> = {
				answer: currentAnswer.answer,
				contents: {
					[contentId]: {
						value: imageUrl,
					},
				},
			};

			await addGameAnswer(game.id, answerData);
			await loadAnswers();

			// Reset form and show success message
			setCurrentAnswer({
				answer: "",
				contents: {},
			});
			setImageUrl("");
			setSuccess("Answer added successfully!");

			// Clear success message after 3 seconds
			setTimeout(() => {
				setSuccess("");
			}, 3000);
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
				setTimeout(() => {
					setSuccess("");
				}, 3000);
			} catch (err) {
				setError("Failed to delete answer");
			}
		}
	};

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Add Image Answer</h2>

				<div className="space-y-4">
					{/* Image URL Input */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Image URL
						</label>
						<input
							type="url"
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="https://example.com/image.jpg"
							required
						/>
					</div>

					{/* Image Preview */}
					{imageUrl && (
						<div className="mt-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Preview
							</label>
							<img
								src={imageUrl}
								alt="Preview"
								className="max-w-full h-auto rounded border border-gray-200"
								onError={() => setError("Invalid image URL")}
							/>
						</div>
					)}

					{/* Answer Input */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Correct Answer
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
							placeholder="e.g., Ability Name"
							required
						/>
					</div>

					{/* Error Display */}
					{error && (
						<div className="bg-red-50 text-red-500 p-3 rounded">
							{error}
						</div>
					)}

					{/* Success Display */}
					{success && (
						<div className="bg-green-50 text-green-500 p-3 rounded">
							{success}
						</div>
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

			{/* Answers List */}
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
									{Object.entries(answer.contents || {}).map(
										([contentId, content]) => (
											<img
												key={contentId}
												src={content.value}
												alt={answer.answer} // Now this is definitely a string
												className="max-w-full h-auto rounded border border-gray-200"
											/>
										)
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
		</div>
	);
}

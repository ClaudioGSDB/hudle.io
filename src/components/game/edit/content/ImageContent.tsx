"use client";

import { useState, useEffect } from "react";
import { Game, ImageGameAnswer } from "@/types/game";
import {
	getGameAnswers,
	createGameAnswer,
	deleteGameAnswer,
} from "@/services/game";

interface ImageContentProps {
	game: Game;
	onUpdate: () => void;
}

export default function ImageContent({ game, onUpdate }: ImageContentProps) {
	const [answers, setAnswers] = useState<ImageGameAnswer[]>([]);
	const [newImage, setNewImage] = useState("");
	const [newAnswer, setNewAnswer] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as ImageGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoading(false);
		}
	};

	const handleAddAnswer = async () => {
		if (!newImage || !newAnswer) {
			setError("Both image and answer are required");
			return;
		}

		try {
			const contentId = `content_${Date.now()}`;
			await createGameAnswer(game.id, "image_guesser", {
				answer: newAnswer,
				contents: {
					[contentId]: {
						value: newImage,
					},
				},
			});
			await loadAnswers();
			setNewImage("");
			setNewAnswer("");
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
				<h3 className="text-lg font-semibold mb-4">Add New Answer</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Image URL
						</label>
						<input
							type="url"
							value={newImage}
							onChange={(e) => setNewImage(e.target.value)}
							className="w-full px-3 py-2 border rounded-md"
							placeholder="https://example.com/image.jpg"
						/>
					</div>
					{newImage && (
						<img
							src={newImage}
							alt="Preview"
							className="max-w-full h-auto rounded"
						/>
					)}
					<div>
						<label className="block text-sm font-medium mb-1">
							Answer
						</label>
						<input
							type="text"
							value={newAnswer}
							onChange={(e) => setNewAnswer(e.target.value)}
							className="w-full px-3 py-2 border rounded-md"
							placeholder="Correct answer"
						/>
					</div>
					{error && <p className="text-red-500">{error}</p>}
					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Answer
					</button>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Current Answers</h3>
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
									<img
										key={contentId}
										src={content.value}
										alt={answer.answer}
										className="max-w-full h-auto rounded mt-2"
									/>
								)
							)}
						</div>
					))}
					{answers.length === 0 && (
						<p className="text-gray-500 text-center py-4">
							No answers added yet
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

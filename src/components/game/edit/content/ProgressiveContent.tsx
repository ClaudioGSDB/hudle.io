"use client";

import { useState, useEffect } from "react";
import { Game, ProgressiveGameAnswer } from "@/types/game";
import {
	getGameAnswers,
	createGameAnswer,
	deleteGameAnswer,
} from "@/services/game";

interface ProgressiveContentProps {
	game: Game;
	onUpdate: () => void;
}

export default function ProgressiveContent({
	game,
	onUpdate,
}: ProgressiveContentProps) {
	const [answers, setAnswers] = useState<ProgressiveGameAnswer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	type ContentType = "text" | "image";

	const [currentContent, setCurrentContent] = useState<{
		type: ContentType;
		content: string;
		order: number;
	}>({
		type: "text",
		content: "",
		order: 1,
	});

	const [contentItems, setContentItems] = useState<
		Array<{
			type: string;
			content: string;
			order: number;
		}>
	>([]);
	const [newAnswer, setNewAnswer] = useState("");

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as ProgressiveGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoading(false);
		}
	};

	const handleAddContent = () => {
		if (!currentContent.content) {
			setError("Content is required");
			return;
		}

		setContentItems((prev) => [...prev, currentContent]);
		setCurrentContent({
			type: "text",
			content: "",
			order: contentItems.length + 2,
		});
	};

	const handleAddAnswer = async () => {
		if (!newAnswer || contentItems.length === 0) {
			setError("Answer and at least one content item are required");
			return;
		}

		try {
			const contents: ProgressiveGameAnswer["contents"] = {};
			contentItems.forEach((item, index) => {
				contents[`content_${index}`] = {
					value: item.content,
					revealOrder: item.order,
				};
			});

			await createGameAnswer(game.id, "progressive", {
				answer: newAnswer,
				contents,
			});

			await loadAnswers();
			setNewAnswer("");
			setContentItems([]);
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

	const removeContentItem = (index: number) => {
		setContentItems((prev) => prev.filter((_, i) => i !== index));
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">
					Add Progressive Answer
				</h3>
				<div className="space-y-6">
					{/* Content Items */}
					{contentItems.length > 0 && (
						<div className="space-y-2">
							<h4 className="font-medium">Added Content:</h4>
							{contentItems.map((item, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-gray-50 rounded"
								>
									<div>
										<span className="font-medium">
											#{item.order}
										</span>
										<span className="ml-2 text-gray-600">
											{item.type}:
										</span>
										<span className="ml-2">
											{item.content}
										</span>
									</div>
									<button
										onClick={() => removeContentItem(index)}
										className="text-red-500 hover:text-red-700"
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}

					{/* Add Content Form */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								Content Type
							</label>
							<select
								value={currentContent.type}
								onChange={(e) =>
									setCurrentContent((prev) => ({
										...prev,
										type: e.target.value as ContentType,
									}))
								}
								className="w-full px-3 py-2 border rounded-md"
							>
								<option value="text">Text</option>
								<option value="image">Image</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								Content
							</label>
							{currentContent.type === "text" ? (
								<textarea
									value={currentContent.content}
									onChange={(e) =>
										setCurrentContent((prev) => ({
											...prev,
											content: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border rounded-md"
									rows={3}
								/>
							) : (
								<input
									type="url"
									value={currentContent.content}
									onChange={(e) =>
										setCurrentContent((prev) => ({
											...prev,
											content: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border rounded-md"
									placeholder="Image URL"
								/>
							)}
						</div>

						<button
							onClick={handleAddContent}
							className="w-full py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
						>
							Add Content Item
						</button>
					</div>

					{/* Answer Input */}
					<div>
						<label className="block text-sm font-medium mb-1">
							Answer
						</label>
						<input
							type="text"
							value={newAnswer}
							onChange={(e) => setNewAnswer(e.target.value)}
							className="w-full px-3 py-2 border rounded-md"
							placeholder="Enter the answer"
						/>
					</div>

					{error && <p className="text-red-500">{error}</p>}

					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Progressive Answer
					</button>
				</div>
			</div>

			{/* Current Answers */}
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

							{Object.entries(answer.contents)
								.sort(
									([, a], [, b]) =>
										(a.revealOrder || 0) -
										(b.revealOrder || 0)
								)
								.map(([contentId, content]) => (
									<div
										key={contentId}
										className="p-2 bg-gray-50 rounded mb-2"
									>
										<div className="text-sm text-gray-500">
											Step {content.revealOrder}
										</div>
										{content.value.startsWith("http") ? (
											<img
												src={content.value}
												alt="Content"
												className="max-w-full h-auto mt-1 rounded"
											/>
										) : (
											<div className="mt-1">
												{content.value}
											</div>
										)}
									</div>
								))}
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

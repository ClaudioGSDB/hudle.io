"use client";

import { useState } from "react";
import { Game, GameAnswer, GameContent } from "@/types/game";
import { updateGame, addGameAnswer } from "@/services/game";

interface ProgressiveSetupProps {
	game: Game;
	setGame: (game: Game) => void;
}

interface ContentItem {
	type: "text" | "image" | "attribute";
	content: string;
	order: number;
}

export default function ProgressiveSetup({
	game,
	setGame,
}: ProgressiveSetupProps) {
	const [currentAnswer, setCurrentAnswer] = useState<Partial<GameAnswer>>({
		answer: "",
		contents: {},
	});

	const [contentItems, setContentItems] = useState<ContentItem[]>([]);
	const [currentContent, setCurrentContent] = useState<ContentItem>({
		type: "text",
		content: "",
		order: 1,
	});

	const [error, setError] = useState("");

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
		if (!currentAnswer.answer || contentItems.length === 0) {
			setError("Answer and at least one content item are required");
			return;
		}

		try {
			const contents: { [key: string]: { value: string } } = {};
			contentItems.forEach((item, index) => {
				contents[`content_${index}`] = {
					value: item.content,
				};
			});

			const answerData: Partial<GameAnswer> = {
				answer: currentAnswer.answer,
				contents,
			};

			await addGameAnswer(game.id, answerData as GameAnswer);

			// Update game with content configuration
			const gameContents: GameContent[] = contentItems.map(
				(item, index) => ({
					id: `content_${index}`,
					type: item.type,
					content: item.content,
					revealOrder: item.order,
				})
			);

			await updateGame(game.id, {
				...game,
				contents: gameContents,
			});

			// Reset form
			setCurrentAnswer({
				answer: "",
				contents: {},
			});
			setContentItems([]);
			setCurrentContent({
				type: "text",
				content: "",
				order: 1,
			});
			setError("");
		} catch (err) {
			setError("Failed to add answer");
			console.error(err);
		}
	};

	const removeContent = (index: number) => {
		setContentItems((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">
					Add Progressive Answer
				</h2>

				<div className="space-y-6">
					{/* Content Items List */}
					{contentItems.length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-gray-700">
								Added Content:
							</h3>
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
										onClick={() => removeContent(index)}
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
							<label className="block text-sm font-medium text-gray-700">
								Content Type
							</label>
							<select
								value={currentContent.type}
								onChange={(e) =>
									setCurrentContent((prev) => ({
										...prev,
										type: e.target.value as
											| "text"
											| "image"
											| "attribute",
									}))
								}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							>
								<option value="text">Text</option>
								<option value="image">Image</option>
								<option value="attribute">Attribute</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
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
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
									rows={3}
								/>
							) : (
								<input
									type="text"
									value={currentContent.content}
									onChange={(e) =>
										setCurrentContent((prev) => ({
											...prev,
											content: e.target.value,
										}))
									}
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
									placeholder={
										currentContent.type === "image"
											? "Image URL"
											: "Attribute value"
									}
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
					<div className="pt-6 border-t">
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
								placeholder="Enter the correct answer"
								required
							/>
						</div>
					</div>

					{/* Error Display */}
					{error && (
						<div className="text-red-500 text-sm">{error}</div>
					)}

					{/* Submit Button */}
					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Save Progressive Answer
					</button>
				</div>
			</div>
		</div>
	);
}

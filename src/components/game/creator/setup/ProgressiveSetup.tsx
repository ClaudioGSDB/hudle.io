"use client";

import { useState, useEffect } from "react";
import { Game, ProgressiveGameAnswer, GameContent } from "@/types/game";
import {
	updateGame,
	createGameAnswer,
	getGameAnswers,
	deleteGameAnswer,
} from "@/services/game";
import { useRouter } from "next/navigation";

interface ProgressiveSetupProps {
	game: Game;
	setGame: (game: Game) => void;
}

export default function ProgressiveSetup({
	game,
	setGame,
}: ProgressiveSetupProps) {
	const [currentAnswer, setCurrentAnswer] = useState<
		Partial<ProgressiveGameAnswer>
	>({
		answer: "",
		contents: {},
	});
	type ContentType = "text" | "image" | "attribute";

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
		Array<{ type: string; content: string; order: number }>
	>([]);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [answers, setAnswers] = useState<ProgressiveGameAnswer[]>([]);
	const [loadingAnswers, setLoadingAnswers] = useState(true);
	const router = useRouter();

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			setLoadingAnswers(true);
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as ProgressiveGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoadingAnswers(false);
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
		setSuccess("Content item added");
		setTimeout(() => setSuccess(""), 3000);
	};

	const handleAddAnswer = async () => {
		if (!currentAnswer.answer || contentItems.length === 0) {
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

			const answerData: Partial<ProgressiveGameAnswer> = {
				answer: currentAnswer.answer,
				contents,
			};

			await createGameAnswer(game.id, "progressive", answerData);
			await loadAnswers();

			setCurrentAnswer({ answer: "", contents: {} });
			setContentItems([]);
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
			} catch (err) {
				setError("Failed to delete answer");
			}
		}
	};

	const removeContent = (index: number) => {
		setContentItems((prev) => prev.filter((_, i) => i !== index));
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
										type: e.target.value as ContentType,
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
								value={currentAnswer.answer}
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

					{/* Error/Success Messages */}
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

					{/* Submit Button */}
					<button
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Save Progressive Answer
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
									{Object.entries(answer.contents)
										.sort(
											([, a], [, b]) =>
												(a.revealOrder || 0) -
												(b.revealOrder || 0)
										)
										.map(([contentId, content]) => (
											<div
												key={contentId}
												className="p-2 bg-gray-50 rounded"
											>
												<div className="text-sm text-gray-500">
													Step {content.revealOrder}
												</div>
												{content.value}
											</div>
										))}
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

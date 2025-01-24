//src/components/game/creator/setup/AttributeGuesserSetup.tsx
"use client";

import { useState, useEffect } from "react";
import { Game, AttributeConfig, AttributeGameAnswer } from "@/types/game";
import {
	updateGame,
	createGameAnswer,
	getGameAnswers,
	deleteGameAnswer,
	updateGameAnswer,
} from "@/services/game";
import { useRouter } from "next/navigation";

interface AttributeGuesserSetupProps {
	game: Game;
	setGame: (game: Game) => void;
}

export default function AttributeGuesserSetup({
	game,
	setGame,
}: AttributeGuesserSetupProps) {
	const [currentAnswer, setCurrentAnswer] = useState<
		Partial<AttributeGameAnswer>
	>({
		answer: "",
		attributeValues: {},
	});
	const [currentAttribute, setCurrentAttribute] = useState<
		Partial<AttributeConfig>
	>({
		name: "",
		type: "text",
		possibleValues: [],
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [answers, setAnswers] = useState<AttributeGameAnswer[]>([]);
	const [loadingAnswers, setLoadingAnswers] = useState(true);
	const router = useRouter();
	const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<{
		answer: string;
		attributeValues: Record<string, any>;
	} | null>(null);
	const [editingAttribute, setEditingAttribute] = useState<string | null>(
		null
	);
	const [newValue, setNewValue] = useState("");

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			setLoadingAnswers(true);
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as AttributeGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoadingAnswers(false);
		}
	};

	const handleAddAttribute = async () => {
		if (!currentAttribute.name) {
			setError("Attribute name is required");
			return;
		}

		try {
			const updatedGame = {
				...game,
				attributes: [
					...(game.attributes || []),
					{
						id: `attr_${Date.now()}`,
						name: currentAttribute.name,
						type: currentAttribute.type || "text",
						possibleValues: currentAttribute.possibleValues || [],
					} as AttributeConfig,
				],
			};

			await updateGame(game.id, updatedGame);
			setGame(updatedGame);
			setCurrentAttribute({
				name: "",
				type: "text",
				possibleValues: [],
			});
			setError("");
			setSuccess("Attribute added successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError("Failed to add attribute");
		}
	};

	const handleAddAnswer = async () => {
		if (!currentAnswer.answer) {
			setError("Answer is required");
			return;
		}

		if (
			answers.some(
				(answer) =>
					answer.answer.toLowerCase() ===
					currentAnswer.answer?.toLowerCase()
			)
		) {
			setError("An answer with this name already exists");
			return;
		}

		if (!game.attributes?.length) {
			setError("Add at least one attribute before adding answers");
			return;
		}

		const missingAttributes = game.attributes.filter(
			(attr) =>
				!currentAnswer.attributeValues ||
				!currentAnswer.attributeValues[attr.id]
		);

		if (missingAttributes.length > 0) {
			setError(
				`Please provide values for: ${missingAttributes
					.map((attr) => attr.name)
					.join(", ")}`
			);
			return;
		}

		try {
			await createGameAnswer(game.id, "attribute_guesser", currentAnswer);
			await loadAnswers();
			setCurrentAnswer({
				answer: "",
				attributeValues: {},
			});
			setError("");
		} catch (err) {
			setError("Failed to add answer");
		}
	};

	const handleRemoveAttribute = async (attrId: string) => {
		try {
			const updatedGame = {
				...game,
				attributes:
					game.attributes?.filter((attr) => attr.id !== attrId) || [],
			};

			// Update all answers to remove the deleted attribute
			const updatedAnswers = answers.map((answer) => {
				const newAttributeValues = { ...answer.attributeValues };
				delete newAttributeValues[attrId];
				return { ...answer, attributeValues: newAttributeValues };
			});

			await updateGame(game.id, updatedGame);

			// Update each answer in the database
			await Promise.all(
				updatedAnswers.map((answer) =>
					updateGameAnswer(game.id, answer.id, {
						attributeValues: answer.attributeValues,
					})
				)
			);

			setGame(updatedGame);
			await loadAnswers();
		} catch (err) {
			setError("Failed to remove attribute");
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

	const handleAddPossibleValue = () => {
		const value = prompt("Enter a possible value:");
		if (value && !currentAttribute.possibleValues?.includes(value)) {
			setCurrentAttribute((prev) => ({
				...prev,
				possibleValues: [...(prev.possibleValues || []), value],
			}));
		}
	};

	const handleRemovePossibleValue = (indexToRemove: number) => {
		setCurrentAttribute((prev) => ({
			...prev,
			possibleValues: prev.possibleValues?.filter(
				(_, index) => index !== indexToRemove
			),
		}));
	};

	const handleEditAnswer = (answer: AttributeGameAnswer) => {
		setEditingAnswer(answer.id);
		setEditValues({
			answer: answer.answer,
			attributeValues: { ...answer.attributeValues },
		});
	};

	const handleSaveEdit = async (answerId: string) => {
		if (!editValues) return;

		try {
			await updateGameAnswer(game.id, answerId, editValues);
			await loadAnswers();
			setEditingAnswer(null);
			setEditValues(null);
		} catch (err) {
			setError("Failed to update answer");
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

	// Add handler
	const handleAddValueToAttribute = async (attrId: string, value: string) => {
		if (!value.trim()) return;

		const attr = game.attributes?.find((a) => a.id === attrId);
		if (!attr || attr.possibleValues?.includes(value)) {
			setError("Value already exists");
			return;
		}

		try {
			const updatedGame = {
				...game,
				attributes: game.attributes?.map((a) =>
					a.id === attrId
						? {
								...a,
								possibleValues: [
									...(a.possibleValues || []),
									value,
								],
						  }
						: a
				),
			};

			await updateGame(game.id, updatedGame);
			setGame(updatedGame);
			setNewValue("");
			setEditingAttribute(null);
		} catch (err) {
			setError("Failed to add value");
		}
	};

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">
					Configure Attributes
				</h2>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Attribute Name
						</label>
						<input
							type="text"
							value={currentAttribute.name}
							onChange={(e) =>
								setCurrentAttribute((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="e.g., Gender, Species, etc."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Attribute Type
						</label>
						<select
							value={currentAttribute.type}
							onChange={(e) =>
								setCurrentAttribute((prev) => ({
									...prev,
									type: e.target.value as any,
								}))
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
						>
							<option value="text">Text</option>
							<option value="number">Number</option>
							<option value="array">Multiple Values</option>
							<option value="boolean">Yes/No</option>
						</select>
					</div>

					{currentAttribute.type !== "boolean" && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Possible Values
							</label>
							<div className="flex flex-wrap gap-2 mb-2">
								{currentAttribute.possibleValues?.map(
									(value, index) => (
										<span
											key={index}
											className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
										>
											{value}
											<button
												type="button"
												onClick={() =>
													handleRemovePossibleValue(
														index
													)
												}
												className="ml-1 text-blue-600 hover:text-blue-800"
											>
												×
											</button>
										</span>
									)
								)}
							</div>
							<button
								type="button"
								onClick={handleAddPossibleValue}
								className="text-sm text-blue-600 hover:text-blue-700"
							>
								+ Add Value
							</button>
						</div>
					)}

					{error && (
						<div className="text-red-500 text-sm">{error}</div>
					)}
					{success && (
						<div className="text-green-500 text-sm">{success}</div>
					)}

					<button
						type="button"
						onClick={handleAddAttribute}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Attribute
					</button>
				</div>

				{game.attributes && game.attributes.length > 0 && (
					<div className="mt-6">
						<h3 className="text-lg font-medium mb-2">
							Current Attributes
						</h3>
						<div className="space-y-2">
							{game.attributes.map((attr) => (
								<div
									key={attr.id}
									className="p-3 bg-gray-50 rounded"
								>
									<div className="flex justify-between items-start">
										<div>
											<span className="font-medium">
												{attr.name}
											</span>
											<span className="ml-2 text-sm text-gray-500">
												({attr.type})
											</span>
										</div>
										{attr.type !== "boolean" && (
											<button
												onClick={() =>
													setEditingAttribute(attr.id)
												}
												className="text-blue-500 hover:text-blue-700"
											>
												Add Value
											</button>
										)}
									</div>

									{editingAttribute === attr.id && (
										<div className="mt-2 flex gap-2">
											<input
												type="text"
												value={newValue}
												onChange={(e) =>
													setNewValue(e.target.value)
												}
												className="flex-1 px-2 py-1 border rounded"
												placeholder="New value"
											/>
											<button
												onClick={() =>
													handleAddValueToAttribute(
														attr.id,
														newValue
													)
												}
												className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
											>
												Add
											</button>
											<button
												onClick={() => {
													setEditingAttribute(null);
													setNewValue("");
												}}
												className="px-3 py-1 border rounded hover:bg-gray-50"
											>
												Cancel
											</button>
										</div>
									)}

									{attr.possibleValues &&
										attr.possibleValues.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1">
												{attr.possibleValues.map(
													(value) => (
														<span
															key={value}
															className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
														>
															{value}
														</span>
													)
												)}
											</div>
										)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{game.attributes && game.attributes.length > 0 && (
				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Add Answers</h2>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Answer
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
								placeholder="Enter the answer"
							/>
						</div>

						{game.attributes.map((attr) => (
							<div key={attr.id}>
								<label className="block text-sm font-medium text-gray-700">
									{attr.name}
								</label>
								{attr.type === "boolean" ? (
									<select
										value={String(
											currentAnswer.attributeValues?.[
												attr.id
											] ?? ""
										)}
										onChange={(e) =>
											setCurrentAnswer((prev) => ({
												...prev,
												attributeValues: {
													...prev.attributeValues,
													[attr.id]:
														e.target.value ===
														"true",
												},
											}))
										}
										className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
									>
										<option value="">Select...</option>
										<option value="true">Yes</option>
										<option value="false">No</option>
									</select>
								) : (
									<select
										value={String(
											currentAnswer.attributeValues?.[
												attr.id
											] ?? ""
										)}
										onChange={(e) =>
											setCurrentAnswer((prev) => ({
												...prev,
												attributeValues: {
													...prev.attributeValues,
													[attr.id]: e.target.value,
												},
											}))
										}
										className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
									>
										<option value="">Select...</option>
										{attr.possibleValues?.map((value) => (
											<option key={value} value={value}>
												{value}
											</option>
										))}
									</select>
								)}
							</div>
						))}

						<button
							type="button"
							onClick={handleAddAnswer}
							className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
						>
							Add Answer
						</button>
					</div>
				</div>
			)}

			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Current Answers</h2>

				{loadingAnswers ? (
					<div className="flex justify-center py-4">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
					</div>
				) : answers.length > 0 ? (
					<div className="space-y-4">
						{answers.map((answer) => (
							<div
								key={answer.id}
								className="border rounded-lg p-4"
							>
								<div className="flex justify-between items-start">
									{editingAnswer === answer.id ? (
										<input
											type="text"
											value={editValues?.answer}
											onChange={(e) =>
												setEditValues((prev) => ({
													...prev!,
													answer: e.target.value,
												}))
											}
											className="font-medium px-2 py-1 border rounded"
										/>
									) : (
										<h4 className="font-medium">
											{answer.answer}
										</h4>
									)}
									<div className="flex gap-2">
										{editingAnswer === answer.id ? (
											<>
												<button
													onClick={() =>
														handleSaveEdit(
															answer.id
														)
													}
													className="text-green-500 hover:text-green-700"
												>
													Save
												</button>
												<button
													onClick={() => {
														setEditingAnswer(null);
														setEditValues(null);
													}}
													className="text-gray-500 hover:text-gray-700"
												>
													Cancel
												</button>
											</>
										) : (
											<>
												<button
													onClick={() =>
														handleEditAnswer(answer)
													}
													className="text-blue-500 hover:text-blue-700"
												>
													Edit
												</button>
												<button
													onClick={() =>
														handleDeleteAnswer(
															answer.id
														)
													}
													className="text-red-500 hover:text-red-700"
												>
													Delete
												</button>
											</>
										)}
									</div>
								</div>
								<div className="mt-2 grid grid-cols-2 gap-2">
									{game.attributes?.map((attr) => (
										<div key={attr.id} className="text-sm">
											<span className="text-gray-600">
												{attr.name}:{" "}
											</span>
											{editingAnswer === answer.id ? (
												attr.type === "boolean" ? (
													<select
														value={String(
															editValues
																?.attributeValues[
																attr.id
															]
														)}
														onChange={(e) =>
															setEditValues(
																(prev) => ({
																	...prev!,
																	attributeValues:
																		{
																			...prev!
																				.attributeValues,
																			[attr.id]:
																				e
																					.target
																					.value ===
																				"true",
																		},
																})
															)
														}
														className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
													>
														<option value="true">
															Yes
														</option>
														<option value="false">
															No
														</option>
													</select>
												) : (
													<select
														value={String(
															editValues
																?.attributeValues[
																attr.id
															]
														)}
														onChange={(e) =>
															setEditValues(
																(prev) => ({
																	...prev!,
																	attributeValues:
																		{
																			...prev!
																				.attributeValues,
																			[attr.id]:
																				e
																					.target
																					.value,
																		},
																})
															)
														}
														className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
													>
														{attr.possibleValues?.map(
															(value) => (
																<option
																	key={value}
																	value={
																		value
																	}
																>
																	{value}
																</option>
															)
														)}
													</select>
												)
											) : (
												<span>
													{String(
														answer.attributeValues[
															attr.id
														]
													)}
												</span>
											)}
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

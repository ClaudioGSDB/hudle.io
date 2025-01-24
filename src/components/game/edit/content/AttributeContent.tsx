//src/components/game/edit/content/AttributeContent.tsx
"use client";

import { useState, useEffect } from "react";
import { Game, AttributeGameAnswer, AttributeConfig } from "@/types/game";
import {
	getGameAnswers,
	createGameAnswer,
	deleteGameAnswer,
	updateGame,
	updateGameAnswer,
} from "@/services/game";

interface AttributeContentProps {
	game: Game;
	onUpdate: () => void;
}

export default function AttributeContent({
	game,
	onUpdate,
}: AttributeContentProps) {
	const [answers, setAnswers] = useState<AttributeGameAnswer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [newAnswer, setNewAnswer] = useState("");
	const [attributeValues, setAttributeValues] = useState<Record<string, any>>(
		{}
	);
	const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<{
		answer: string;
		attributeValues: Record<string, any>;
	} | null>(null);

	const [newAttributeName, setNewAttributeName] = useState("");
	const [newAttributeType, setNewAttributeType] = useState<
		"text" | "number" | "boolean"
	>("text");
	const [possibleValues, setPossibleValues] = useState<string[]>([]);

	const [editingAttribute, setEditingAttribute] = useState<string | null>(
		null
	);
	const [newValue, setNewValue] = useState("");

	useEffect(() => {
		loadAnswers();
	}, [game.id]);

	const loadAnswers = async () => {
		try {
			const gameAnswers = await getGameAnswers(game.id);
			setAnswers(gameAnswers as AttributeGameAnswer[]);
		} catch (err) {
			setError("Failed to load answers");
		} finally {
			setLoading(false);
		}
	};

	const handleAddAttribute = async () => {
		if (!newAttributeName) {
			setError("Attribute name is required");
			return;
		}

		try {
			const newAttribute: AttributeConfig = {
				id: `attr_${Date.now()}`,
				name: newAttributeName,
				type: newAttributeType,
				possibleValues:
					possibleValues.length > 0 ? possibleValues : undefined,
			};

			const updatedGame = {
				...game,
				attributes: [...(game.attributes || []), newAttribute],
			};

			await updateGame(game.id, updatedGame);
			setNewAttributeName("");
			setPossibleValues([]);
			setSuccess("Attribute added successfully!");
			setTimeout(() => setSuccess(""), 3000);
			onUpdate();
		} catch (err) {
			setError("Failed to add attribute");
		}
	};

	const handleAddAnswer = async () => {
		if (!newAnswer) {
			setError("Answer is required");
			return;
		}

		if (
			answers.some(
				(answer) =>
					answer.answer.toLowerCase() === newAnswer.toLowerCase()
			)
		) {
			setError("An answer with this name already exists");
			return;
		}

		if (!Object.keys(attributeValues).length) {
			setError("Add at least one attribute value");
			return;
		}

		try {
			await createGameAnswer(game.id, "attribute_guesser", {
				answer: newAnswer,
				attributeValues,
			});

			await loadAnswers();
			setNewAnswer("");
			setAttributeValues({});
			setSuccess("Answer added successfully!");
			setTimeout(() => setSuccess(""), 3000);
			onUpdate();
		} catch (err) {
			setError("Failed to add answer");
		}
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
			setSuccess("Answer updated successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError("Failed to update answer");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		if (!window.confirm("Are you sure you want to delete this answer?"))
			return;

		try {
			await deleteGameAnswer(game.id, answerId);
			await loadAnswers();
			setSuccess("Answer deleted successfully!");
			setTimeout(() => setSuccess(""), 3000);
			onUpdate();
		} catch (err) {
			setError("Failed to delete answer");
		}
	};

	const handleAddPossibleValue = () => {
		const value = prompt("Enter a possible value:");
		if (value && !possibleValues.includes(value)) {
			setPossibleValues([...possibleValues, value]);
		}
	};

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
			setSuccess("Value added successfully!");
			setTimeout(() => setSuccess(""), 3000);
			setNewValue("");
			setEditingAttribute(null);
			onUpdate();
		} catch (err) {
			setError("Failed to add value");
		}
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">
					Add New Attribute
				</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Attribute Name
						</label>
						<input
							type="text"
							value={newAttributeName}
							onChange={(e) =>
								setNewAttributeName(e.target.value)
							}
							className="w-full px-3 py-2 border rounded-md"
							placeholder="e.g., Height, Color, etc."
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Type
						</label>
						<select
							value={newAttributeType}
							onChange={(e) =>
								setNewAttributeType(e.target.value as any)
							}
							className="w-full px-3 py-2 border rounded-md"
						>
							<option value="text">Text</option>
							<option value="number">Number</option>
							<option value="boolean">Yes/No</option>
						</select>
					</div>
					{newAttributeType !== "boolean" && (
						<div>
							<label className="block text-sm font-medium mb-1">
								Possible Values
							</label>
							<div className="flex flex-wrap gap-2 mb-2">
								{possibleValues.map((value, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
									>
										{value}
									</span>
								))}
							</div>
							<button
								type="button"
								onClick={handleAddPossibleValue}
								className="text-blue-600 hover:text-blue-800 text-sm"
							>
								+ Add Value
							</button>
						</div>
					)}
					<button
						onClick={handleAddAttribute}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Add Attribute
					</button>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Add New Answer</h3>
				<div className="space-y-4">
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
					{game.attributes?.map((attr) => (
						<div key={attr.id}>
							<label className="block text-sm font-medium mb-1">
								{attr.name}
							</label>
							{attr.type === "boolean" ? (
								<select
									value={String(
										attributeValues[attr.id] ?? ""
									)}
									onChange={(e) =>
										setAttributeValues({
											...attributeValues,
											[attr.id]:
												e.target.value === "true",
										})
									}
									className="w-full px-3 py-2 border rounded-md"
								>
									<option value="">Select...</option>
									<option value="true">Yes</option>
									<option value="false">No</option>
								</select>
							) : (
								<select
									value={String(
										attributeValues[attr.id] ?? ""
									)}
									onChange={(e) =>
										setAttributeValues({
											...attributeValues,
											[attr.id]: e.target.value,
										})
									}
									className="w-full px-3 py-2 border rounded-md"
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
						onClick={handleAddAnswer}
						className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
					>
						Add Answer
					</button>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">
					Current Attributes
				</h3>
				<div className="space-y-4">
					{game.attributes?.map((attr) => (
						<div key={attr.id} className="p-3 bg-gray-50 rounded">
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
										{attr.possibleValues.map((value) => (
											<span
												key={value}
												className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
											>
												{value}
											</span>
										))}
									</div>
								)}
						</div>
					))}
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Current Answers</h3>
				<div className="space-y-4">
					{answers.map((answer) => (
						<div key={answer.id} className="border rounded-lg p-4">
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
										className="px-2 py-1 border rounded"
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
													handleSaveEdit(answer.id)
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
													className="px-2 py-1 border rounded text-sm w-full"
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
													className="px-2 py-1 border rounded text-sm w-full"
												>
													{attr.possibleValues?.map(
														(value) => (
															<option
																key={value}
																value={value}
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
					{answers.length === 0 && (
						<p className="text-gray-500 text-center py-4">
							No answers added yet
						</p>
					)}
				</div>
			</div>

			{(error || success) && (
				<div
					className={`p-4 rounded ${
						error
							? "bg-red-50 text-red-500"
							: "bg-green-50 text-green-500"
					}`}
				>
					{error || success}
				</div>
			)}
		</div>
	);
}

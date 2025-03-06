//src/components/game/creator/GameCreatorForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createGame } from "@/services/game";
import { Game, GuessType } from "@/types/game";

const GAME_TYPES = [
	{
		id: "attribute_guesser",
		name: "Attribute Guesser",
		description: "Players guess based on matching attributes (like Loldle Champion)",
	},
	{
		id: "image_guesser",
		name: "Image Guesser",
		description: "Players guess based on images (like Loldle Ability)",
	},
	{
		id: "quote_guesser",
		name: "Quote Guesser",
		description: "Players guess who said a quote",
	},
	{
		id: "progressive",
		name: "Progressive Reveal",
		description: "Reveal more information after each guess",
	},
];

export default function GameCreatorForm() {
	const { user } = useAuth();
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [gameData, setGameData] = useState<Partial<Game>>({
		title: "",
		description: "",
		type: "",
		guessType: "exact",
		contents: [],
		settings: {
			allowSkip: false,
			showProgress: true,
			requiresLogin: true,
		},
		tags: [],
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleTypeSelect = (typeId: string) => {
		setGameData((prev) => ({
			...prev,
			type: typeId,
		}));
		setCurrentStep(1);
	};

	const handleBasicInfoSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!gameData.title || !gameData.description) {
			setError("Please fill in all required fields");
			return;
		}
		setError("");
		setCurrentStep(2);
	};

	const handleSettingsSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setCurrentStep(3);
	};

	const handleFinalSubmit = async () => {
		if (!user) {
			setError("You must be logged in to create a game");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const gameId = await createGame(user.uid, gameData);
			router.push(`/creator/game/${gameId}/setup`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create game");
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex justify-between items-center">
					{GAME_TYPES.map((_, index) => (
						<div
							key={index}
							className={`h-2 flex-1 mx-1 rounded ${
								index <= currentStep ? "bg-blue-500" : "bg-gray-200"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
					{error}
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<div className="flex items-center space-x-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
							<p>Creating your game...</p>
						</div>
					</div>
				</div>
			)}

			{currentStep === 0 && (
				<div className="grid grid-cols-2 gap-4">
					{GAME_TYPES.map((type, index) => (
						<button
							key={type.id}
							onClick={() => handleTypeSelect(type.id)}
							className={`p-6 border rounded-lg ${
								index !== 0
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "hover:border-blue-500 hover:bg-blue-50"
							}`}
							disabled={index !== 0}
						>
							<h3 className="text-lg font-semibold mb-2">{type.name}</h3>
							<p
								className={`${
									index !== 0 ? "text-gray-400" : "text-gray-600"
								}`}
							>
								{type.description}
							</p>
						</button>
					))}
				</div>
			)}

			{currentStep === 1 && (
				<form onSubmit={handleBasicInfoSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Game Title
						</label>
						<input
							type="text"
							value={gameData.title}
							onChange={(e) =>
								setGameData((prev) => ({
									...prev,
									title: e.target.value,
								}))
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Description
						</label>
						<textarea
							value={gameData.description}
							onChange={(e) =>
								setGameData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							rows={4}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Tags (comma separated)
						</label>
						<input
							type="text"
							value={gameData.tags?.join(", ")}
							onChange={(e) =>
								setGameData((prev) => ({
									...prev,
									tags: e.target.value
										.split(",")
										.map((tag) => tag.trim()),
								}))
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="e.g., anime, characters, daily"
						/>
					</div>

					<button
						type="submit"
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Continue
					</button>
				</form>
			)}

			{currentStep === 2 && (
				<form onSubmit={handleSettingsSubmit} className="space-y-6">
					<div className="space-y-4">
						<label className="flex items-center space-x-3">
							<input
								type="checkbox"
								checked={gameData.settings?.allowSkip}
								onChange={(e) =>
									setGameData((prev) => ({
										...prev,
										settings: {
											...prev.settings!,
											allowSkip: e.target.checked,
										},
									}))
								}
								className="rounded border-gray-300"
							/>
							<span>Allow Skip</span>
						</label>

						<label className="flex items-center space-x-3">
							<input
								type="checkbox"
								checked={gameData.settings?.requiresLogin}
								onChange={(e) =>
									setGameData((prev) => ({
										...prev,
										settings: {
											...prev.settings!,
											requiresLogin: e.target.checked,
										},
									}))
								}
								className="rounded border-gray-300"
							/>
							<span>Require Login to Play</span>
						</label>
					</div>

					<button
						type="submit"
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Continue
					</button>
				</form>
			)}

			{currentStep === 3 && (
				<div className="space-y-6">
					<div className="bg-gray-50 p-6 rounded-lg">
						<h3 className="font-semibold mb-4">Game Summary</h3>
						<dl className="space-y-2">
							<dt className="text-sm text-gray-600">Type:</dt>
							<dd className="mb-2">
								{GAME_TYPES.find((t) => t.id === gameData.type)?.name}
							</dd>

							<dt className="text-sm text-gray-600">Title:</dt>
							<dd className="mb-2">{gameData.title}</dd>

							<dt className="text-sm text-gray-600">Description:</dt>
							<dd className="mb-2">{gameData.description}</dd>

							<dt className="text-sm text-gray-600">Settings:</dt>
							<dd>
								<ul className="list-disc pl-5">
									{gameData.settings?.allowSkip && (
										<li>Skipping Allowed</li>
									)}
									{gameData.settings?.requiresLogin && (
										<li>Login Required</li>
									)}
								</ul>
							</dd>
						</dl>
					</div>

					{error && (
						<div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
					)}

					<button
						onClick={handleFinalSubmit}
						disabled={loading}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
					>
						{loading ? "Creating..." : "Create Game"}
					</button>
				</div>
			)}
		</div>
	);
}

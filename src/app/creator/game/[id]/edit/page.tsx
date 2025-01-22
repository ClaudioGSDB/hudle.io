"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Game } from "@/types/game";
import { getGame, updateGame } from "@/services/game";
import EditContent from "@/components/game/edit/EditContent";

export default function EditGamePage() {
	const params = useParams();
	const router = useRouter();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");

	useEffect(() => {
		loadGame();
	}, [params.id]);

	const loadGame = async () => {
		try {
			const gameData = await getGame(params.id as string);
			if (!gameData) throw new Error("Game not found");
			setGame(gameData);
			setTitle(gameData.title);
			setDescription(gameData.description);
			setTags(gameData.tags);
		} catch (err) {
			setError("Failed to load game");
		} finally {
			setLoading(false);
		}
	};

	const handleAddTag = () => {
		if (newTag.trim() && !tags.includes(newTag.trim())) {
			setTags([...tags, newTag.trim()]);
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleSave = async () => {
		if (!game) return;

		setSaving(true);
		try {
			await updateGame(game.id, {
				...game,
				title,
				description,
				tags,
			});
			router.push("/dashboard");
		} catch (err) {
			setError("Failed to save changes");
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (!game) {
		return (
			<div className="text-center py-12 text-red-500">
				{error || "Game not found"}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow p-6">
					<h1 className="text-2xl font-bold mb-6">Edit Game</h1>

					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Title
							</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-3 py-2 border rounded-md"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								className="w-full px-3 py-2 border rounded-md"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Tags
							</label>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									onKeyDown={(e) =>
										e.key === "Enter" && handleAddTag()
									}
									className="flex-1 px-3 py-2 border rounded-md"
									placeholder="Add tag..."
								/>
								<button
									onClick={handleAddTag}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{tags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800"
									>
										{tag}
										<button
											onClick={() => handleRemoveTag(tag)}
											className="ml-1.5 text-blue-600 hover:text-blue-800"
										>
											×
										</button>
									</span>
								))}
							</div>
						</div>

						{error && <div className="text-red-500">{error}</div>}

						<div className="flex justify-end gap-4">
							<button
								onClick={() => router.push("/dashboard")}
								className="px-4 py-2 border rounded-md hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={saving}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
							>
								{saving ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</div>
				</div>

				{/* Game Content Section */}
				<div className="mt-8">
					<h2 className="text-xl font-bold mb-4">Game Content</h2>
					<EditContent game={game} onUpdate={loadGame} />
				</div>
			</div>
		</div>
	);
}

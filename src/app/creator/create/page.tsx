//src/app/creator/create/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import GameCreatorForm from "@/components/game/creator/GameCreatorForm";

export default function CreateGamePage() {
	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h1 className="text-3xl font-bold">Create New Game</h1>
						<p className="mt-2 text-gray-600">
							Follow the steps below to create your custom -dle
							game
						</p>
					</div>

					<GameCreatorForm />
				</div>
			</div>
		</ProtectedRoute>
	);
}

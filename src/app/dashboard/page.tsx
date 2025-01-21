"use client";

import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function DashboardContent() {
	const { user, logout } = useAuth();

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-md mx-auto">
				<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
				<div className="bg-white shadow rounded-lg p-6">
					<p className="mb-4">Welcome, {user?.email}!</p>
					<button
						onClick={() => logout()}
						className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<ProtectedRoute>
			<DashboardContent />
		</ProtectedRoute>
	);
}

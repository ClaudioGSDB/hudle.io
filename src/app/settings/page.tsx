//src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
	const { user } = useAuth();
	const [email, setEmail] = useState(user?.email || "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleUpdateEmail = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await updateEmail(user, email);
			setSuccess("Email updated successfully");
		} catch (err) {
			setError("Failed to update email. You may need to sign in again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await updatePassword(user, newPassword);
			setSuccess("Password updated successfully");
			setNewPassword("");
			setConfirmPassword("");
			setCurrentPassword("");
		} catch (err) {
			setError(
				"Failed to update password. You may need to sign in again."
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto px-4">
					<h1 className="text-3xl font-bold mb-8">
						Account Settings
					</h1>

					{error && (
						<div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
							{error}
						</div>
					)}

					{success && (
						<div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
							{success}
						</div>
					)}

					{/* Email Settings */}
					<div className="bg-white rounded-lg shadow overflow-hidden mb-6">
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-4">
								Email Settings
							</h2>
							<form
								onSubmit={handleUpdateEmail}
								className="space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Email Address
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
										required
									/>
								</div>
								<button
									type="submit"
									disabled={loading}
									className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
								>
									Update Email
								</button>
							</form>
						</div>
					</div>

					{/* Password Settings */}
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-4">
								Password Settings
							</h2>
							<form
								onSubmit={handleUpdatePassword}
								className="space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Current Password
									</label>
									<input
										type="password"
										value={currentPassword}
										onChange={(e) =>
											setCurrentPassword(e.target.value)
										}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										New Password
									</label>
									<input
										type="password"
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Confirm New Password
									</label>
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
										required
									/>
								</div>
								<button
									type="submit"
									disabled={loading}
									className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
								>
									Update Password
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}

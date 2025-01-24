//src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const signUp = async (email: string, password: string) => {
		try {
			const result = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			setUser(result.user);
		} catch (error) {
			console.error("Signup error:", error);
			throw error;
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			const result = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			setUser(result.user);
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
			setUser(null);
		} catch (error) {
			console.error("Logout error:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

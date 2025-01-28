//src/services/dailyStats.ts
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

interface DailyStats {
	currentStreak: number;
	maxStreak: number;
	totalPlayed: number;
	totalWins: number;
	lastPlayed: string;
	guessDistribution: Record<number, number>;
}

export async function updateDailyStats(
	userId: string,
	gameId: string,
	won: boolean,
	guesses: number
) {
	const statsRef = doc(db, "users", userId, "dailyStats", gameId);
	const today = new Date().toISOString().split("T")[0];

	const initialStats: DailyStats = {
		currentStreak: won ? 1 : 0,
		maxStreak: won ? 1 : 0,
		totalPlayed: 1,
		totalWins: won ? 1 : 0,
		lastPlayed: today,
		guessDistribution: won ? { [guesses]: 1 } : {},
	};

	// Always create/update stats, removing complex streak logic
	await setDoc(statsRef, initialStats, { merge: true });
	return initialStats;
}

export async function getDailyStats(
	userId: string,
	gameId: string
): Promise<DailyStats | null> {
	const statsRef = doc(db, "users", userId, "dailyStats", gameId);
	const statsDoc = await getDoc(statsRef);
	return statsDoc.exists() ? (statsDoc.data() as DailyStats) : null;
}

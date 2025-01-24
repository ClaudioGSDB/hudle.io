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
	const statsDoc = await getDoc(statsRef);
	const today = new Date().toISOString().split("T")[0];

	if (!statsDoc.exists()) {
		// Initialize stats
		const initialStats: DailyStats = {
			currentStreak: won ? 1 : 0,
			maxStreak: won ? 1 : 0,
			totalPlayed: 1,
			totalWins: won ? 1 : 0,
			lastPlayed: today,
			guessDistribution: won ? { [guesses]: 1 } : {},
		};
		await setDoc(statsRef, initialStats);
		return initialStats;
	}

	const currentStats = statsDoc.data() as DailyStats;
	const lastPlayed = new Date(currentStats.lastPlayed);
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const isConsecutive =
		lastPlayed.toISOString().split("T")[0] ===
		yesterday.toISOString().split("T")[0];
	const newStreak = won
		? isConsecutive
			? currentStats.currentStreak + 1
			: 1
		: 0;

	const updates = {
		currentStreak: newStreak,
		maxStreak: Math.max(newStreak, currentStats.maxStreak),
		totalPlayed: increment(1),
		totalWins: increment(won ? 1 : 0),
		lastPlayed: today,
		[`guessDistribution.${guesses}`]: increment(won ? 1 : 0),
	};

	await updateDoc(statsRef, updates);

	return {
		...currentStats,
		...updates,
		totalPlayed: currentStats.totalPlayed + 1,
		totalWins: currentStats.totalWins + (won ? 1 : 0),
		guessDistribution: {
			...currentStats.guessDistribution,
			[guesses]:
				(currentStats.guessDistribution[guesses] || 0) + (won ? 1 : 0),
		},
	};
}

export async function getDailyStats(
	userId: string,
	gameId: string
): Promise<DailyStats | null> {
	const statsRef = doc(db, "users", userId, "dailyStats", gameId);
	const statsDoc = await getDoc(statsRef);
	return statsDoc.exists() ? (statsDoc.data() as DailyStats) : null;
}

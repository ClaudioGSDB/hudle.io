//src/services/userStats.ts
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserStats {
	totalGamesPlayed: number;
	dailyStreak: number;
	achievements: {
		firstWin: boolean;
		perfectGames: number;
		maxStreak: number;
	};
	gameStats: {
		[gameId: string]: {
			played: number;
			won: number;
			avgAttempts: number;
		};
	};
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
	const statsRef = doc(db, "userStats", userId);
	const statsDoc = await getDoc(statsRef);
	return statsDoc.exists() ? (statsDoc.data() as UserStats) : null;
}

export async function updateUserStats(
	userId: string,
	gameId: string,
	won: boolean,
	attempts: number
): Promise<UserStats> {
	const statsRef = doc(db, "userStats", userId);
	const existingStats = await getUserStats(userId);

	const newStats: UserStats = existingStats || {
		totalGamesPlayed: 0,
		dailyStreak: 0,
		achievements: {
			firstWin: false,
			perfectGames: 0,
			maxStreak: 0,
		},
		gameStats: {},
	};

	// Update game-specific stats
	if (!newStats.gameStats[gameId]) {
		newStats.gameStats[gameId] = {
			played: 0,
			won: 0,
			avgAttempts: 0,
		};
	}

	const gameStats = newStats.gameStats[gameId];
	gameStats.played++;
	if (won) {
		gameStats.won++;
		newStats.dailyStreak++;
		newStats.achievements.maxStreak = Math.max(
			newStats.achievements.maxStreak,
			newStats.dailyStreak
		);

		if (!newStats.achievements.firstWin) {
			newStats.achievements.firstWin = true;
		}

		if (attempts === 1) {
			newStats.achievements.perfectGames++;
		}
	} else {
		newStats.dailyStreak = 0;
	}

	// Update average attempts
	gameStats.avgAttempts =
		(gameStats.avgAttempts * (gameStats.played - 1) + attempts) /
		gameStats.played;

	newStats.totalGamesPlayed++;

	await setDoc(statsRef, newStats);
	return newStats;
}

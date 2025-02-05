//src/services/gamesPlayed.ts
import { db } from "@/lib/firebase";
import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	updateDoc,
	doc,
} from "firebase/firestore";

interface PlayStats {
	attempts: number;
	won: boolean;
	timeSpent: number;
	guesses: string[];
}

const PLAYS_COLLECTION = "plays";

export async function recordGameStart(
	userId: string | null,
	gameId: string
): Promise<string | null> {
	if (!userId) return null; // Skip recording if no user

	try {
		const play = {
			userId,
			gameId,
			startedAt: new Date().toISOString(),
			status: "in_progress",
		};

		const docRef = await addDoc(collection(db, PLAYS_COLLECTION), play);
		return docRef.id;
	} catch (error) {
		console.error("Error recording game start:", error);
		return null;
	}
}

export async function recordGameEnd(
	playId: string | null,
	stats: PlayStats
): Promise<void> {
	if (!playId) return; // Skip if no playId (unauthenticated user)

	try {
		const playRef = doc(db, PLAYS_COLLECTION, playId);
		await updateDoc(playRef, {
			...stats,
			status: "completed",
			completedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error recording game end:", error);
	}
}

export async function getGameStats(gameId: string) {
	try {
		const q = query(
			collection(db, PLAYS_COLLECTION),
			where("gameId", "==", gameId)
		);
		const querySnapshot = await getDocs(q);

		const stats = {
			totalPlays: 0,
			completedPlays: 0,
			winRate: 0,
			guessDistribution: {} as Record<number, number>,
			averageTime: 0,
		};

		let totalAttempts = 0;
		let totalTime = 0;
		let wins = 0;

		querySnapshot.forEach((doc) => {
			const data = doc.data();
			stats.totalPlays++;

			if (data.status === "completed") {
				stats.completedPlays++;

				if (data.won) {
					wins++;
					// Update guess distribution
					const attemptCount =
						stats.guessDistribution[data.attempts] || 0;
					stats.guessDistribution[data.attempts] = attemptCount + 1;
				}

				if (data.timeSpent) {
					totalTime += data.timeSpent;
				}

				if (data.attempts) {
					totalAttempts += data.attempts;
				}
			}
		});

		if (stats.completedPlays > 0) {
			stats.winRate = (wins / stats.completedPlays) * 100;
			stats.averageTime = totalTime / stats.completedPlays;
		}

		return stats;
	} catch (error) {
		console.error("Error getting game stats:", error);
		return {
			totalPlays: 0,
			completedPlays: 0,
			winRate: 0,
			guessDistribution: {},
			averageTime: 0,
		};
	}
}

export async function getUserGameHistory(userId: string | null) {
	if (!userId) return []; // Return empty array for unauthenticated users

	try {
		const q = query(
			collection(db, PLAYS_COLLECTION),
			where("userId", "==", userId)
		);
		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
	} catch (error) {
		console.error("Error getting user game history:", error);
		return [];
	}
}

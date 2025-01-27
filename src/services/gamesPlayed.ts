//src/services/gamesPlayed.ts
import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	updateDoc,
	getDoc,
	doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PLAYS_COLLECTION = "plays";

interface PlayStats {
	attempts: number;
	won: boolean;
	timeSpent: number;
	guesses: string[];
	completedAt?: string;
}

export async function recordGameStart(userId: string, gameId: string) {
	const play = {
		userId,
		gameId,
		startedAt: new Date().toISOString(),
		status: "in_progress",
	};

	const docRef = await addDoc(collection(db, PLAYS_COLLECTION), play);
	return docRef.id;
}

export async function recordGameEnd(playId: string, stats: PlayStats) {
	const playRef = doc(db, PLAYS_COLLECTION, playId);
	await updateDoc(playRef, {
		...stats,
		status: "completed",
		completedAt: new Date().toISOString(),
	});
}

export async function getGameStats(gameId: string) {
	const q = query(
		collection(db, PLAYS_COLLECTION),
		where("gameId", "==", gameId)
	);
	const querySnapshot = await getDocs(q);

	const stats = {
		totalPlays: 0,
		completedPlays: 0,
		averageAttempts: 0,
		winRate: 0,
		guessDistribution: {} as Record<number, number>,
		averageTime: 0,
	};

	let totalAttempts = 0;
	let totalTime = 0;
	let totalWins = 0;

	querySnapshot.forEach((doc) => {
		const data = doc.data();
		stats.totalPlays++;

		if (data.status === "completed") {
			stats.completedPlays++;
			totalAttempts += data.attempts || 0;
			totalTime += data.timeSpent || 0;

			if (data.won) {
				totalWins++;
				// Update guess distribution
				const attemptCount =
					stats.guessDistribution[data.attempts] || 0;
				stats.guessDistribution[data.attempts] = attemptCount + 1;
			}
		}
	});

	if (stats.completedPlays > 0) {
		stats.averageAttempts = totalAttempts / stats.completedPlays;
		stats.winRate = (totalWins / stats.completedPlays) * 100;
		stats.averageTime = totalTime / stats.completedPlays;
	}

	return stats;
}

export async function getUserGameHistory(userId: string) {
	const q = query(
		collection(db, PLAYS_COLLECTION),
		where("userId", "==", userId)
	);
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

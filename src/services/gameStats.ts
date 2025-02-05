//src/services/gameStats.ts
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface GameStats {
	totalPlays: number;
	completedPlays: number;
	rating: number;
	currentPlayers: number;
}

export async function getGameStats(gameId: string): Promise<GameStats> {
	try {
		const playsRef = collection(db, "plays");
		const q = query(playsRef, where("gameId", "==", gameId));
		const querySnapshot = await getDocs(q);

		let totalPlays = 0;
		let completedPlays = 0;
		let totalRating = 0;
		let ratingCount = 0;
		let currentPlayers = 0;
		const lastHour = new Date();
		lastHour.setHours(lastHour.getHours() - 1);

		querySnapshot.forEach((doc) => {
			const play = doc.data();
			totalPlays++;

			if (play.status === "completed") {
				completedPlays++;
			}

			if (play.rating) {
				totalRating += play.rating;
				ratingCount++;
			}

			// Count players who started within the last hour as "current"
			if (play.startedAt && new Date(play.startedAt) > lastHour) {
				currentPlayers++;
			}
		});

		return {
			totalPlays,
			completedPlays,
			rating:
				ratingCount > 0 ? +(totalRating / ratingCount).toFixed(1) : 0,
			currentPlayers,
		};
	} catch (error) {
		console.error("Error getting game stats:", error);
		return {
			totalPlays: 0,
			completedPlays: 0,
			rating: 0,
			currentPlayers: 0,
		};
	}
}

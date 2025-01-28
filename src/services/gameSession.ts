//src/services/gameSession.ts
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GameSession {
	userId?: string;
	gameId: string;
	date: string;
	attempts: string[];
	attributeResults: Record<string, boolean>;
	startedAt: string;
	completedAt?: string;
	isComplete: boolean;
}

function getLocalStorageKey(gameId: string) {
	const today = new Date().toISOString().split("T")[0];
	return `game_session_${gameId}_${today}`;
}

export async function getGameSession(
	gameId: string,
	userId?: string
): Promise<GameSession | null> {
	const today = new Date().toISOString().split("T")[0];

	if (userId) {
		const sessionRef = doc(
			db,
			"gameSessions",
			`${userId}_${gameId}_${today}`
		);
		const sessionDoc = await getDoc(sessionRef);
		return sessionDoc.exists() ? (sessionDoc.data() as GameSession) : null;
	} else {
		const sessionData = localStorage.getItem(getLocalStorageKey(gameId));
		return sessionData ? JSON.parse(sessionData) : null;
	}
}

export async function saveGameSession(
	session: GameSession,
	userId?: string
): Promise<void> {
	if (userId) {
		const sessionRef = doc(
			db,
			"gameSessions",
			`${userId}_${session.gameId}_${session.date}`
		);
		await setDoc(sessionRef, session);
	} else {
		localStorage.setItem(
			getLocalStorageKey(session.gameId),
			JSON.stringify(session)
		);
	}
}

export function createNewSession(gameId: string, userId?: string): GameSession {
	return {
		userId,
		gameId,
		date: new Date().toISOString().split("T")[0],
		attempts: [],
		attributeResults: {},
		startedAt: new Date().toISOString(),
		isComplete: false,
	};
}

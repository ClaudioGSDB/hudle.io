//src/services/game.ts
import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
	Game,
	GameAnswer,
	AttributeGameAnswer,
	ImageGameAnswer,
	QuoteGameAnswer,
	ProgressiveGameAnswer,
} from "@/types/game";

const GAMES_COLLECTION = "games";
const ANSWERS_COLLECTION = "answers";

export async function createGame(
	creatorId: string,
	gameData: Partial<Game>
): Promise<string> {
	try {
		const gamesRef = collection(db, GAMES_COLLECTION);
		const newGameRef = doc(gamesRef);

		const game: Game = {
			id: newGameRef.id,
			creatorId,
			title: gameData.title || "Untitled Game",
			description: gameData.description || "",
			type: gameData.type || "custom",
			guessType: gameData.guessType || "exact",
			contents: gameData.contents || [],
			attributes: gameData.attributes || [],
			settings: {
				allowSkip: gameData.settings?.allowSkip || false,
				showProgress: gameData.settings?.showProgress || true,
				requiresLogin: gameData.settings?.requiresLogin || false,
				...gameData.settings,
			},
			isPublished: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			tags: gameData.tags || [],
		};

		await setDoc(newGameRef, game);
		return game.id;
	} catch (error) {
		console.error("Error creating game:", error);
		throw error;
	}
}

export async function updateGame(
	gameId: string,
	updates: Partial<Game>
): Promise<void> {
	try {
		const gameRef = doc(db, GAMES_COLLECTION, gameId);
		await updateDoc(gameRef, {
			...updates,
			updatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error updating game:", error);
		throw error;
	}
}

export async function getGame(gameId: string): Promise<Game | null> {
	try {
		const gameRef = doc(db, GAMES_COLLECTION, gameId);
		const gameSnap = await getDoc(gameRef);
		return gameSnap.exists() ? (gameSnap.data() as Game) : null;
	} catch (error) {
		console.error("Error getting game:", error);
		return null;
	}
}

export async function getPublicGames(limitCount: number = 20): Promise<Game[]> {
	try {
		const gamesRef = collection(db, GAMES_COLLECTION);
		const q = query(
			gamesRef,
			where("isPublished", "==", true),
			orderBy("createdAt", "desc"),
			firestoreLimit(limitCount)
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => doc.data() as Game);
	} catch (error) {
		console.error("Error getting public games:", error);
		return [];
	}
}

export async function getCreatorGames(creatorId: string): Promise<Game[]> {
	try {
		const gamesRef = collection(db, GAMES_COLLECTION);
		const q = query(gamesRef, where("creatorId", "==", creatorId));
		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => doc.data() as Game);
	} catch (error) {
		console.error("Error getting creator games:", error);
		return [];
	}
}

export async function createGameAnswer(
	gameId: string,
	gameType: string,
	answerData: Partial<
		| AttributeGameAnswer
		| ImageGameAnswer
		| QuoteGameAnswer
		| ProgressiveGameAnswer
	>
): Promise<string> {
	try {
		const answersRef = collection(
			db,
			GAMES_COLLECTION,
			gameId,
			ANSWERS_COLLECTION
		);
		const newAnswerRef = doc(answersRef);

		const baseAnswer = {
			id: newAnswerRef.id,
			gameId,
			...answerData,
		};

		let answer: GameAnswer;
		switch (gameType) {
			case "attribute_guesser":
				answer = {
					...baseAnswer,
					answer: answerData.answer || "",
					attributeValues:
						(answerData as Partial<AttributeGameAnswer>)
							.attributeValues || {},
				} as AttributeGameAnswer;
				break;
			case "image_guesser":
				answer = {
					...baseAnswer,
					answer: answerData.answer || "",
					contents:
						(answerData as Partial<ImageGameAnswer>).contents || {},
				} as ImageGameAnswer;
				break;
			case "quote_guesser":
				answer = {
					...baseAnswer,
					answer: answerData.answer || "",
					contents:
						(answerData as Partial<QuoteGameAnswer>).contents || {},
				} as QuoteGameAnswer;
				break;
			case "progressive":
				answer = {
					...baseAnswer,
					answer: answerData.answer || "",
					contents:
						(answerData as Partial<ProgressiveGameAnswer>)
							.contents || {},
				} as ProgressiveGameAnswer;
				break;
			default:
				throw new Error(`Unsupported game type: ${gameType}`);
		}

		await setDoc(newAnswerRef, answer);
		return answer.id;
	} catch (error) {
		console.error("Error creating game answer:", error);
		throw error;
	}
}

export async function getGameAnswers(gameId: string): Promise<GameAnswer[]> {
	try {
		const answersRef = collection(
			db,
			GAMES_COLLECTION,
			gameId,
			ANSWERS_COLLECTION
		);
		const querySnapshot = await getDocs(answersRef);
		return querySnapshot.docs.map((doc) => doc.data() as GameAnswer);
	} catch (error) {
		console.error("Error getting game answers:", error);
		return [];
	}
}

export async function deleteGameAnswer(
	gameId: string,
	answerId: string
): Promise<void> {
	try {
		const answerRef = doc(
			db,
			GAMES_COLLECTION,
			gameId,
			ANSWERS_COLLECTION,
			answerId
		);
		await deleteDoc(answerRef);
	} catch (error) {
		console.error("Error deleting game answer:", error);
		throw error;
	}
}

export async function deleteGame(gameId: string): Promise<void> {
	try {
		const gameRef = doc(db, GAMES_COLLECTION, gameId);
		await deleteDoc(gameRef);
	} catch (error) {
		console.error("Error deleting game:", error);
		throw error;
	}
}

export async function updateGameAnswer(
	gameId: string,
	answerId: string,
	updates: Partial<GameAnswer>
): Promise<void> {
	try {
		const answerRef = doc(
			db,
			GAMES_COLLECTION,
			gameId,
			ANSWERS_COLLECTION,
			answerId
		);
		await updateDoc(answerRef, updates);
	} catch (error) {
		console.error("Error updating game answer:", error);
		throw error;
	}
}

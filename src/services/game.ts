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
const PLAYS_COLLECTION = "plays";

export async function createGame(
	creatorId: string,
	gameData: Partial<Game>
): Promise<string> {
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
			isDailyChallenge: gameData.settings?.isDailyChallenge || false,
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
}

export async function updateGame(
	gameId: string,
	updates: Partial<Game>
): Promise<void> {
	const gameRef = doc(db, GAMES_COLLECTION, gameId);
	await updateDoc(gameRef, {
		...updates,
		updatedAt: new Date().toISOString(),
	});
}

export async function getGame(gameId: string): Promise<Game | null> {
	const gameRef = doc(db, GAMES_COLLECTION, gameId);
	const gameSnap = await getDoc(gameRef);
	return gameSnap.exists() ? (gameSnap.data() as Game) : null;
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

	// Create the appropriate answer type based on game type
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
					(answerData as Partial<ProgressiveGameAnswer>).contents ||
					{},
			} as ProgressiveGameAnswer;
			break;
		default:
			throw new Error(`Unsupported game type: ${gameType}`);
	}

	await setDoc(newAnswerRef, answer);
	return answer.id;
}

export async function getGameAnswers(gameId: string): Promise<GameAnswer[]> {
	const answersRef = collection(
		db,
		GAMES_COLLECTION,
		gameId,
		ANSWERS_COLLECTION
	);
	const querySnapshot = await getDocs(answersRef);
	return querySnapshot.docs.map((doc) => doc.data() as GameAnswer);
}

export async function deleteGameAnswer(
	gameId: string,
	answerId: string
): Promise<void> {
	const answerRef = doc(
		db,
		GAMES_COLLECTION,
		gameId,
		ANSWERS_COLLECTION,
		answerId
	);
	await deleteDoc(answerRef);
}

export async function getPublicGames(limitCount: number = 10): Promise<Game[]> {
	const gamesRef = collection(db, GAMES_COLLECTION);
	const q = query(
		gamesRef,
		where("isPublished", "==", true),
		orderBy("createdAt", "desc"),
		firestoreLimit(limitCount)
	);

	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => doc.data() as Game);
}

export async function getCreatorGames(creatorId: string): Promise<Game[]> {
	const gamesRef = collection(db, GAMES_COLLECTION);
	const q = query(gamesRef, where("creatorId", "==", creatorId));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => doc.data() as Game);
}

//src/services/dailyChallenge.ts
import { getGameAnswers } from "./game";

export function getDailySeed(gameId: string): number {
	const today = new Date();
	const dateString = `${today.getFullYear()}-${
		today.getMonth() + 1
	}-${today.getDate()}`;
	const seed = dateString
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return gameId
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), seed);
}

export async function getDailyAnswer(gameId: string) {
	const answers = await getGameAnswers(gameId);
	if (answers.length === 0) return null;

	const seed = getDailySeed(gameId);
	const index = seed % answers.length;
	return answers[index];
}

export function getDailyResetTime(): Date {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	return tomorrow;
}

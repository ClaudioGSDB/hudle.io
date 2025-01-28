//src/services/dailyChallenge.ts
import { getGameAnswers } from "./game";

export function getDailySeed(gameId: string, testDate?: Date): number {
	const date = testDate || new Date();
	const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
	// Use prime numbers for better distribution
	const prime1 = 31;
	const prime2 = 17;
	const hash = (daysSinceEpoch * prime1 + gameId.length * prime2) % 1000000;
	return hash;
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

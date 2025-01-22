// Basic types
export type ContentType = "text" | "image" | "audio" | "attribute" | "video";
export type GuessType = "exact" | "partial" | "contains" | "category";
export type AttributeType = "text" | "number" | "array" | "boolean";

// Attribute configuration
export interface AttributeConfig {
	id: string;
	name: string;
	type: AttributeType;
	possibleValues?: string[];
	allowMultiple?: boolean;
	compareFunction?: "exact" | "partial" | "range" | "contains";
	displayType?: "text" | "icon" | "color";
}

// Game content
export interface GameContent {
	id: string;
	type: ContentType;
	content: string;
	revealOrder?: number;
	hint?: string;
	category?: string;
}

// Game settings
export interface GameSettings {
	isDailyChallenge: boolean;
	allowSkip: boolean;
	showProgress: boolean;
	requiresLogin: boolean;
	difficulty?: "easy" | "medium" | "hard";
	customSettings?: Record<string, any>;
}

// Main Game interface
export interface Game {
	id: string;
	creatorId: string;
	title: string;
	description: string;
	type: string;
	guessType: GuessType;
	maxAttempts?: number;
	timeLimit?: number;
	isProgressive?: boolean;
	contents: GameContent[];
	attributes?: AttributeConfig[];
	settings: GameSettings;
	createdAt: string;
	updatedAt: string;
	tags: string[];
	isPublished: boolean; // Add this line
}

// Base Game Answer
interface BaseGameAnswer {
	id: string;
	gameId: string;
	contents?: {
		[contentId: string]: {
			value: string;
			feedback?: Record<string, string>;
		};
	};
	hint?: string;
	activeDate?: string;
	expiryDate?: string;
}

// Attribute Game Answer
export interface AttributeGameAnswer extends BaseGameAnswer {
	answer: string;
	attributeValues: {
		[attributeId: string]: string | number | boolean | string[];
	};
}

// Image Game Answer
export interface ImageGameAnswer extends BaseGameAnswer {
	answer: string;
	contents: {
		[contentId: string]: {
			value: string;
			feedback?: Record<string, string>;
		};
	};
}

// Quote Game Answer
export interface QuoteGameAnswer extends BaseGameAnswer {
	answer: string;
	contents: {
		[contentId: string]: {
			value: string; // The quote text
			feedback?: Record<string, string>;
		};
	};
}

// Progressive Game Answer
export interface ProgressiveGameAnswer extends BaseGameAnswer {
	answer: string;
	contents: {
		[contentId: string]: {
			value: string;
			revealOrder: number;
			feedback?: Record<string, string>;
		};
	};
}

// Union type for all game answers
export type GameAnswer =
	| AttributeGameAnswer
	| ImageGameAnswer
	| QuoteGameAnswer
	| ProgressiveGameAnswer;

// Guess feedback
export interface GuessFeedback {
	correct: boolean;
	partialMatch?: boolean;
	hints?: string[];
	attributeFeedback?: Record<string, any>;
	hintsUsed: number;
}

// Guess attempt
export interface GuessAttempt {
	attempt: string;
	timestamp: string;
	revealedContents: string[];
	feedback: GuessFeedback;
}

// Gameplay
export interface GamePlay {
	id: string;
	gameId: string;
	userId: string;
	answerId: string;
	guesses: GuessAttempt[];
	stats: {
		startedAt: string;
		completedAt?: string;
		timeSpent: number;
		won: boolean;
		score?: number;
		hintsUsed: number;
	};
}

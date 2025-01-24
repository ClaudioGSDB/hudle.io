//src/components/game/ShareResults.tsx
import { useState } from "react";
import { ShareIcon, CheckIcon } from "@heroicons/react/24/outline";

interface ShareResultsProps {
	gameTitle: string;
	attempts: number;
	maxAttempts: number;
	attributeResults: Record<string, boolean>[];
}

export default function ShareResults({
	gameTitle,
	attempts,
	maxAttempts,
	attributeResults,
}: ShareResultsProps) {
	const [copied, setCopied] = useState(false);

	const generateShareText = () => {
		const date = new Date().toLocaleDateString();
		const results = attributeResults
			.map((result) => {
				return Object.values(result)
					.map((correct) => (correct ? "🟩" : "🟥"))
					.join("");
			})
			.join("\n");

		return `${gameTitle} - Daily Challenge ${date}\n${attempts}/${maxAttempts} attempts\n\n${results}`;
	};

	const handleShare = async () => {
		const text = generateShareText();

		if (navigator.share) {
			try {
				await navigator.share({ text });
				return;
			} catch (err) {
				// Fall back to clipboard
			}
		}

		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<button
			onClick={handleShare}
			className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
		>
			{copied ? (
				<>
					<CheckIcon className="h-5 w-5" />
					Copied!
				</>
			) : (
				<>
					<ShareIcon className="h-5 w-5" />
					Share Results
				</>
			)}
		</button>
	);
}

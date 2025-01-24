//src/components/game/edit/EditContent.tsx
"use client";

import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import AttributeContent from "./content/AttributeContent";
import ImageContent from "./content/ImageContent";
import QuoteContent from "./content/QuoteContent";
import ProgressiveContent from "./content/ProgressiveContent";

interface EditContentProps {
	game: Game;
	onUpdate: () => void;
}

export default function EditContent({ game, onUpdate }: EditContentProps) {
	const ContentComponent = {
		attribute_guesser: AttributeContent,
		image_guesser: ImageContent,
		quote_guesser: QuoteContent,
		progressive: ProgressiveContent,
	}[game.type];

	if (!ContentComponent) {
		return <div>Unsupported game type</div>;
	}

	return <ContentComponent game={game} onUpdate={onUpdate} />;
}

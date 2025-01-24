//src/components/home/CategoryFilter.tsx
import { Fragment, useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";

const CATEGORIES = [
	"Daily",
	"Movies",
	"TV Shows",
	"Games",
	"Anime",
	"Books",
	"Sports",
	"Music",
	"Geography",
	"History",
];

interface CategoryFilterProps {
	selected: string | null;
	onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
	selected,
	onSelect,
}: CategoryFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleCategorySelect = (category: string | null) => {
		onSelect(category);
		setIsOpen(false);
	};

	return (
		<div className="relative inline-block text-left" ref={dropdownRef}>
			<div>
				<button
					type="button"
					className="inline-flex justify-between w-44 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
					onClick={() => setIsOpen(!isOpen)}
				>
					{selected || "All Categories"}
					<ChevronDownIcon
						className={classNames("h-5 w-5 ml-2 -mr-1", {
							"transform rotate-180": isOpen,
						})}
					/>
				</button>
			</div>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-10">
					<div className="py-1">
						<button
							onClick={() => handleCategorySelect(null)}
							className={classNames(
								"block px-4 py-2 text-sm w-full text-left",
								!selected
									? "bg-gray-100 text-gray-900"
									: "text-gray-700 hover:bg-gray-50"
							)}
						>
							All Categories
						</button>
						{CATEGORIES.map((category) => (
							<button
								key={category}
								onClick={() => handleCategorySelect(category)}
								className={classNames(
									"block px-4 py-2 text-sm w-full text-left",
									selected === category
										? "bg-gray-100 text-gray-900"
										: "text-gray-700 hover:bg-gray-50"
								)}
							>
								{category}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

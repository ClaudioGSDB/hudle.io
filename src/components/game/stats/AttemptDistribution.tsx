//src/components/game/stats/AttemptDistribution.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface AttemptDistributionProps {
	distribution: Record<number, number>;
	maxAttempts: number;
}

export default function AttemptDistribution({
	distribution,
	maxAttempts,
}: AttemptDistributionProps) {
	const data = Array.from({ length: maxAttempts }, (_, i) => ({
		attempts: i + 1,
		count: distribution[i + 1] || 0,
	}));

	const maxCount = Math.max(...Object.values(distribution), 1);

	return (
		<div className="mt-4">
			<h3 className="text-sm font-medium text-gray-700 mb-2">
				Attempt Distribution
			</h3>
			<div className="w-full h-48">
				<BarChart
					data={data}
					width={500}
					height={200}
					margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
				>
					<XAxis
						dataKey="attempts"
						label={{ value: "Attempts", position: "bottom" }}
					/>
					<YAxis
						label={{
							value: "Players",
							angle: -90,
							position: "left",
						}}
					/>
					<Tooltip />
					<Bar dataKey="count" fill="#3b82f6" />
				</BarChart>
			</div>
		</div>
	);
}

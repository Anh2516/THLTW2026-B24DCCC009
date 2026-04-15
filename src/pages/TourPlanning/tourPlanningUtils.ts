import type { BudgetTotals, Destination, DestinationType, PlanItem, PlannedRow } from './types';

export function filterAndSortDestinations(
	all: Destination[],
	typeFilter: 'Tất cả' | DestinationType,
	sortBy: 'rating' | 'price',
): Destination[] {
	const byType = typeFilter === 'Tất cả' ? all : all.filter((d) => d.type === typeFilter);
	const sorted = [...byType].sort((a, b) => {
		if (sortBy === 'rating') return b.rating - a.rating;
		return a.priceLevel - b.priceLevel;
	});
	return sorted;
}

export function toPlannedRows(plan: PlanItem[], destinations: Destination[]): PlannedRow[] {
	return plan
		.map((p) => {
			const destination = destinations.find((d) => d.id === p.destinationId);
			return destination ? { ...p, destination } : null;
		})
		.filter(Boolean) as PlannedRow[];
}

export function computeBudgetStats(planned: PlannedRow[]): BudgetTotals {
	const totals = planned.reduce(
		(acc, item) => {
			acc.food += item.destination.foodCost;
			acc.transport += item.destination.transportCost;
			acc.stay += item.destination.stayCost;
			acc.totalHours += item.destination.visitHours;
			return acc;
		},
		{ food: 0, transport: 0, stay: 0, totalHours: 0 },
	);
	const total = totals.food + totals.transport + totals.stay;
	return { ...totals, total };
}

export function computePopularLocation(plan: PlanItem[], destinations: Destination[]): string {
	const map = new Map<string, number>();
	plan.forEach((p) => {
		const destination = destinations.find((d) => d.id === p.destinationId);
		if (!destination) return;
		const count = map.get(destination.location) || 0;
		map.set(destination.location, count + 1);
	});
	let result = 'Chưa có dữ liệu';
	let max = 0;
	map.forEach((count, location) => {
		if (count > max) {
			max = count;
			result = location;
		}
	});
	return result;
}

export function topDestinationsByRating(destinations: Destination[], limit: number): Destination[] {
	return [...destinations].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function computePopularDestination(plan: PlanItem[], destinations: Destination[]): string {
	const map = new Map<string, number>();
	plan.forEach((p) => {
		const destination = destinations.find((d) => d.id === p.destinationId);
		if (!destination) return;
		const count = map.get(destination.name) || 0;
		map.set(destination.name, count + 1);
	});
	let result = 'Chưa có dữ liệu';
	let max = 0;
	map.forEach((count, name) => {
		if (count > max) {
			max = count;
			result = name;
		}
	});
	return result;
}

export function buildMonthlyPlanStats(plan: PlanItem[]): Array<{ month: string; count: number }> {
	const map = new Map<string, number>();
	plan.forEach((p) => {
		const date = new Date(p.createdAt);
		if (Number.isNaN(date.getTime())) return;
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		map.set(key, (map.get(key) || 0) + 1);
	});
	return [...map.entries()]
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([month, count]) => ({ month, count }));
}

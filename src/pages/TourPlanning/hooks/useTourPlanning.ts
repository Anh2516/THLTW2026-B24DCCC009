import { Form } from 'antd';
import { useMemo, useState } from 'react';
import { MOCK_DESTINATIONS } from '../mockDestinations';
import type { DestinationInput, DestinationType, PlanItem } from '../types';
import {
	buildMonthlyPlanStats,
	computeBudgetStats,
	computePopularDestination,
	computePopularLocation,
	filterAndSortDestinations,
	toPlannedRows,
	topDestinationsByRating,
} from '../tourPlanningUtils';

export function useTourPlanning() {
	const [destinations, setDestinations] = useState(MOCK_DESTINATIONS);
	const [typeFilter, setTypeFilter] = useState<'Tất cả' | DestinationType>('Tất cả');
	const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
	const [plan, setPlan] = useState<PlanItem[]>([]);
	const [form] = Form.useForm<{ destinationId: string; day: number }>();
	const [budgetLimit, setBudgetLimit] = useState(5_000_000);

	const filteredDestinations = useMemo(
		() => filterAndSortDestinations(destinations, typeFilter, sortBy),
		[destinations, typeFilter, sortBy],
	);

	const plannedDestinations = useMemo(() => toPlannedRows(plan, destinations), [plan, destinations]);

	const budgetStats = useMemo(() => computeBudgetStats(plannedDestinations), [plannedDestinations]);

	const topDestinations = useMemo(() => topDestinationsByRating(destinations, 3), [destinations]);

	const popularLocation = useMemo(() => computePopularLocation(plan, destinations), [plan, destinations]);
	const popularDestination = useMemo(() => computePopularDestination(plan, destinations), [plan, destinations]);
	const monthlyPlanStats = useMemo(() => buildMonthlyPlanStats(plan), [plan]);

	const monthlyRevenue = budgetStats.total * 1.25;

	const addPlanItem = async () => {
		const values = await form.validateFields();
		setPlan((prev) => [...prev, { ...values, createdAt: new Date().toISOString() }]);
		form.resetFields();
	};

	const createDestination = (payload: DestinationInput) => {
		setDestinations((prev) => [...prev, { id: `des-${Date.now()}`, ...payload }]);
	};

	const updateDestination = (id: string, payload: DestinationInput) => {
		setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, ...payload } : d)));
	};

	const deleteDestination = (id: string) => {
		setDestinations((prev) => prev.filter((d) => d.id !== id));
		setPlan((prev) => prev.filter((p) => p.destinationId !== id));
	};

	return {
		destinations,
		typeFilter,
		setTypeFilter,
		sortBy,
		setSortBy,
		filteredDestinations,
		plan,
		form,
		addPlanItem,
		plannedDestinations,
		budgetLimit,
		setBudgetLimit,
		budgetStats,
		topDestinations,
		popularLocation,
		popularDestination,
		monthlyPlanStats,
		monthlyRevenue,
		createDestination,
		updateDestination,
		deleteDestination,
	};
}

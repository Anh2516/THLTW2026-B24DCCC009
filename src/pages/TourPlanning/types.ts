export type DestinationType = 'Biển' | 'Núi' | 'Thành phố';

export type Destination = {
	id: string;
	name: string;
	location: string;
	type: DestinationType;
	description: string;
	rating: number;
	image: string;
	priceLevel: number;
	visitHours: number;
	foodCost: number;
	stayCost: number;
	transportCost: number;
};

export type PlanItem = {
	destinationId: string;
	day: number;
	createdAt: string;
};

export type PlannedRow = PlanItem & { destination: Destination };

export type BudgetTotals = {
	food: number;
	transport: number;
	stay: number;
	totalHours: number;
	total: number;
};

export type DestinationInput = Omit<Destination, 'id'>;

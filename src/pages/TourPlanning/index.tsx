import { Col, Row, Space } from 'antd';
import { BudgetSection } from './components/BudgetSection';
import { ExploreSection } from './components/ExploreSection';
import { ItinerarySection } from './components/ItinerarySection';
import { TourPlanningPageHeader } from './components/PageHeader';
import { useTourPlanning } from './hooks/useTourPlanning';

const TourPlanningPage: React.FC = () => {
	const {
		destinations,
		typeFilter,
		setTypeFilter,
		sortBy,
		setSortBy,
		filteredDestinations,
		form,
		addPlanItem,
		plannedDestinations,
		budgetLimit,
		setBudgetLimit,
		budgetStats,
		
	} = useTourPlanning();

	return (
		<Space direction="vertical" size={16} style={{ width: '100%' }}>
			<TourPlanningPageHeader />

			<Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
				<Col xs={24}>
					<ExploreSection
						destinations={filteredDestinations}
						typeFilter={typeFilter}
						sortBy={sortBy}
						onTypeFilterChange={setTypeFilter}
						onSortChange={setSortBy}
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} align="top">
				<Col xs={24} xl={15}>
					<ItinerarySection form={form} destinations={destinations} plannedRows={plannedDestinations} onAdd={addPlanItem} />
				</Col>
				<Col xs={24} xl={9}>
					<BudgetSection budgetLimit={budgetLimit} onBudgetLimitChange={setBudgetLimit} budget={budgetStats} />
				</Col>
			</Row>
		</Space>
	);
};

export default TourPlanningPage;

import { AdminSection } from '../components/AdminSection';
import { MOCK_DESTINATIONS } from '../mockDestinations';

const AdminDashboard = () => {
	return (
		<AdminSection
			destinations={MOCK_DESTINATIONS}
			planCount={10}
			popularDestination="Đà Nẵng"
			popularLocation="Hà Nội"
			monthlyRevenue={100000000}
			budgetStats={{ food: 3000000, stay: 4000000, transport: 2000000, totalHours: 120, total: 9000000 }}
			monthlyPlanStats={[
				{ month: '2026-02', count: 5 },
				{ month: '2026-03', count: 7 },
			]}
			topDestinations={MOCK_DESTINATIONS.slice(0, 3)}
			onCreateDestination={() => undefined}
			onUpdateDestination={() => undefined}
			onDeleteDestination={() => undefined}
		/>
	);
};

export default AdminDashboard;
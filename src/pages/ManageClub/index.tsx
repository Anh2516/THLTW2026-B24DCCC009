import { TabViewPage } from '@/components/TabViewPage';
import { BarChartOutlined, FormOutlined, TeamOutlined, UnorderedListOutlined } from '@ant-design/icons';
import ClubsTab from './ClubsTab';
import MembersTab from './MembersTab';
import RegistrationsTab from './RegistrationsTab';
import ReportsTab from './ReportsTab';

const QuanLyClub: React.FC = () => {
	return (
		<TabViewPage
			cardTitle="Quản lý CLB"
			menu={[
				{
					menuKey: 'clubs',
					title: 'Danh sách CLB',
					icon: <UnorderedListOutlined />,
					content: <ClubsTab />,
				},
				{
					menuKey: 'registrations',
					title: 'Đơn đăng ký',
					icon: <FormOutlined />,
					content: <RegistrationsTab />,
				},
				{
					menuKey: 'members',
					title: 'Thành viên',
					icon: <TeamOutlined />,
					content: <MembersTab />,
				},
				{
					menuKey: 'reports',
					title: 'Báo cáo',
					icon: <BarChartOutlined />,
					content: <ReportsTab />,
				},
			]}
		/>
	);
};

export default QuanLyClub;

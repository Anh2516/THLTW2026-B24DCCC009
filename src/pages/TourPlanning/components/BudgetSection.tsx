import { Alert, Card, InputNumber, Progress, Space, Statistic, Typography } from 'antd';
import type { BudgetTotals } from '../types';
import { currencyFormatter } from '../format';

type Props = {
	budgetLimit: number;
	onBudgetLimitChange: (value: number) => void;
	budget: BudgetTotals;
};

export const BudgetSection: React.FC<Props> = ({ budgetLimit, onBudgetLimitChange, budget }) => {
	const pct = (part: number) => (budget.total ? Math.round((part / budget.total) * 100) : 0);

	return (
		<Card title="Quản lý ngân sách">
			<Space direction="vertical" size={12} style={{ width: '100%' }}>
				<Space direction="vertical" size={4} style={{ width: '100%' }}>
					<Typography.Text>Ngân sách tối đa (đ)</Typography.Text>
					<InputNumber style={{ width: '100%' }} min={0} step={500000} value={budgetLimit} onChange={(v) => onBudgetLimitChange(v || 0)} />
				</Space>

				<Statistic title="Tổng ngân sách ước tính" value={`${currencyFormatter.format(budget.total)} đ`} />
				<Statistic title="Tổng thời gian di chuyển/tham quan" value={`${budget.totalHours} giờ`} />

				<div>
					<Typography.Text>Ăn uống</Typography.Text>
					<Progress percent={pct(budget.food)} />
					<Typography.Text>Di chuyển</Typography.Text>
					<Progress percent={pct(budget.transport)} />
					<Typography.Text>Lưu trú</Typography.Text>
					<Progress percent={pct(budget.stay)} />
				</div>

				{budget.total > budgetLimit ? (
					<Alert
						type="error"
						showIcon
						message="Vượt ngân sách!"
						description={`Bạn đang vượt ${currencyFormatter.format(budget.total - budgetLimit)} đ so với mức cho phép.`}
					/>
				) : (
					<Alert
						type="success"
						showIcon
						message="Ngân sách ổn"
						description={`Còn lại ${currencyFormatter.format(budgetLimit - budget.total)} đ.`}
					/>
				)}
			</Space>
		</Card>
	);
};

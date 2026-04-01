import type { ActionLogEntry, Club, QuanLyClubStore, Registration, RegistrationStatus } from './clubStore.types';
import { message } from 'antd';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';

const STORE_KEY = 'quanly_club_v1';

const makeId = (p: string) => `${p}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const seedStore = (): QuanLyClubStore => {
	const c1 = makeId('club');
	const c2 = makeId('club');
	const c3 = makeId('club');
	const now = new Date().toISOString();
	const y = moment().year();
	return {
		version: 1,
		clubs: [
			{
				id: c1,
				avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=clb1',
				name: 'Câu lạc bộ Lập trình',
				foundedAt: `${y - 2}-09-01`,
				descriptionHtml: '<p>CLB nghiên cứu và thực hành <strong>lập trình</strong>, thuật toán.</p>',
				presidentName: 'Nguyễn Văn A',
				active: true,
				createdAt: now,
			},
			{
				id: c2,
				avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=clb2',
				name: 'Câu lạc bộ Âm nhạc',
				foundedAt: `${y - 5}-03-15`,
				descriptionHtml: '<p>Sân chơi cho các bạn yêu thích <em>ca hát</em> và nhạc cụ.</p>',
				presidentName: 'Trần Thị B',
				active: true,
				createdAt: now,
			},
			{
				id: c3,
				avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=clb3',
				name: 'Câu lạc bộ Thể thao',
				foundedAt: `${y - 1}-01-10`,
				descriptionHtml: '<p>Hoạt động thể dục thể thao, giải đấu nội bộ.</p>',
				presidentName: 'Lê Văn C',
				active: false,
				createdAt: now,
			},
		],
		registrations: [
			{
				id: makeId('reg'),
				fullName: 'Phạm Minh D',
				email: 'd@example.com',
				phone: '0901000001',
				gender: 'Nam',
				address: 'Hà Nội',
				strengths: 'Frontend, UI/UX',
				clubId: c1,
				reason: 'Muốn học hỏi thêm về React',
				status: 'pending',
				notes: '',
				createdAt: now,
			},
			{
				id: makeId('reg'),
				fullName: 'Hoàng Thị E',
				email: 'e@example.com',
				phone: '0901000002',
				gender: 'Nữ',
				address: 'TP.HCM',
				strengths: 'Hát, piano',
				clubId: c2,
				reason: 'Tham gia ban nhạc CLB',
				status: 'approved',
				notes: '',
				createdAt: now,
			},
			{
				id: makeId('reg'),
				fullName: 'Đỗ Văn F',
				email: 'f@example.com',
				phone: '0901000003',
				gender: 'Nam',
				address: 'Đà Nẵng',
				strengths: 'Bóng đá',
				clubId: c3,
				reason: 'Đăng ký đội bóng',
				status: 'rejected',
				notes: 'Hồ sơ chưa đủ minh chứng thể lực',
				createdAt: now,
			},
		],
		actionLogs: [],
	};
};

const parseStore = (): QuanLyClubStore => {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		if (!raw) return seedStore();
		const parsed = JSON.parse(raw) as QuanLyClubStore;
		if (parsed?.version !== 1 || !Array.isArray(parsed.clubs) || !Array.isArray(parsed.registrations)) return seedStore();
		if (!Array.isArray(parsed.actionLogs)) parsed.actionLogs = [];
		return parsed;
	} catch {
		return seedStore();
	}
};

const formatLogTime = () => moment().format('HH:mm DD/MM/YYYY');

export default () => {
	const [store, setStore] = useState<QuanLyClubStore>(() => parseStore());

	const persist = useCallback((next: QuanLyClubStore) => {
		setStore(next);
		localStorage.setItem(STORE_KEY, JSON.stringify(next));
	}, []);

	const clubMap = useMemo(() => new Map(store.clubs.map((c) => [c.id, c])), [store.clubs]);

	const upsertClub = useCallback(
		(payload: Omit<Club, 'id' | 'createdAt'> & { id?: string }) => {
			if (!payload.name?.trim()) {
				message.error('Vui lòng nhập tên câu lạc bộ.');
				return;
			}
			if (payload.id) {
				persist({
					...store,
					clubs: store.clubs.map((c) =>
						c.id === payload.id
							? {
									...c,
									avatarUrl: payload.avatarUrl,
									name: payload.name.trim(),
									foundedAt: payload.foundedAt,
									descriptionHtml: payload.descriptionHtml,
									presidentName: payload.presidentName,
									active: payload.active,
								}
							: c,
					),
				});
				message.success('Đã cập nhật câu lạc bộ.');
				return;
			}
			const club: Club = {
				id: makeId('club'),
				avatarUrl: payload.avatarUrl,
				name: payload.name.trim(),
				foundedAt: payload.foundedAt,
				descriptionHtml: payload.descriptionHtml,
				presidentName: payload.presidentName,
				active: payload.active,
				createdAt: new Date().toISOString(),
			};
			persist({ ...store, clubs: [...store.clubs, club] });
			message.success('Đã thêm câu lạc bộ.');
		},
		[store, persist],
	);

	const deleteClub = useCallback(
		(id: string) => {
			if (store.registrations.some((r) => r.clubId === id)) {
				message.error('Không thể xóa CLB đang có đơn đăng ký / thành viên liên quan.');
				return;
			}
			persist({ ...store, clubs: store.clubs.filter((c) => c.id !== id) });
			message.success('Đã xóa câu lạc bộ.');
		},
		[store, persist],
	);

	const upsertRegistration = useCallback(
		(payload: Omit<Registration, 'id' | 'createdAt' | 'status' | 'notes'> & { id?: string; status?: RegistrationStatus; notes?: string }) => {
			if (!payload.clubId || !clubMap.get(payload.clubId)) {
				message.error('Vui lòng chọn câu lạc bộ hợp lệ.');
				return;
			}
			const status = payload.status ?? 'pending';
			const notes = payload.notes ?? '';
			if (payload.id) {
				if (status === 'rejected' && !notes.trim()) {
					message.error('Trạng thái từ chối bắt buộc có ghi chú / lý do.');
					return;
				}
				persist({
					...store,
					registrations: store.registrations.map((r) =>
						r.id === payload.id
							? {
									...r,
									fullName: payload.fullName.trim(),
									email: payload.email.trim(),
									phone: payload.phone.trim(),
									gender: payload.gender,
									address: payload.address,
									strengths: payload.strengths,
									clubId: payload.clubId,
									reason: payload.reason,
									status,
									notes: status === 'rejected' ? notes.trim() : notes,
								}
							: r,
					),
				});
				message.success('Đã cập nhật đơn đăng ký.');
				return;
			}
			const reg: Registration = {
				id: makeId('reg'),
				fullName: payload.fullName.trim(),
				email: payload.email.trim(),
				phone: payload.phone.trim(),
				gender: payload.gender,
				address: payload.address,
				strengths: payload.strengths,
				clubId: payload.clubId,
				reason: payload.reason,
				status,
				notes,
				createdAt: new Date().toISOString(),
			};
			persist({ ...store, registrations: [reg, ...store.registrations] });
			message.success('Đã thêm đơn đăng ký.');
		},
		[store, persist, clubMap],
	);

	const deleteRegistration = useCallback(
		(id: string) => {
			persist({ ...store, registrations: store.registrations.filter((r) => r.id !== id) });
			message.success('Đã xóa đơn đăng ký.');
		},
		[store, persist],
	);

	const setRegistrationStatus = useCallback(
		(id: string, status: RegistrationStatus, notes?: string) => {
			const reg = store.registrations.find((r) => r.id === id);
			if (!reg) return;
			if (status === 'rejected' && !(notes ?? reg.notes)?.trim()) {
				message.error('Từ chối bắt buộc nhập ghi chú / lý do.');
				return;
			}
			const nextNotes = status === 'rejected' ? (notes ?? '').trim() : reg.notes;
			const time = formatLogTime();
			let logText = '';
			if (status === 'approved') {
				logText = `Quản trị viên đã duyệt đơn lúc ${time}.`;
			} else if (status === 'rejected') {
				logText = `Quản trị viên đã từ chối lúc ${time} với lý do: ${nextNotes}`;
			} else {
				logText = `Đơn được chuyển về trạng thái chờ duyệt lúc ${time}.`;
			}
			persist({
				...store,
				registrations: store.registrations.map((r) =>
					r.id === id ? { ...r, status, notes: status === 'rejected' ? nextNotes : r.notes } : r,
				),
				actionLogs: [{ id: makeId('log'), at: new Date().toISOString(), text: logText, registrationId: id }, ...store.actionLogs],
			});
			message.success('Đã cập nhật trạng thái.');
		},
		[store, persist],
	);

	const bulkSetRegistrationStatus = useCallback(
		(ids: string[], status: RegistrationStatus, rejectReason?: string) => {
			if (!ids.length) return;
			if (status === 'rejected' && !rejectReason?.trim()) {
				message.error('Từ chối hàng loạt bắt buộc nhập lý do.');
				return;
			}
			const time = formatLogTime();
			const newLogs: ActionLogEntry[] = [];
			const idSet = new Set(ids);
			const nextRegs = store.registrations.map((r) => {
				if (!idSet.has(r.id) || r.status !== 'pending') return r;
				if (status === 'rejected') {
					const logText = `Quản trị viên đã từ chối lúc ${time} với lý do: ${rejectReason!.trim()}`;
					newLogs.push({ id: makeId('log'), at: new Date().toISOString(), text: logText, registrationId: r.id });
					return { ...r, status, notes: rejectReason!.trim() };
				}
				const logText = `Quản trị viên đã duyệt đơn lúc ${time}.`;
				newLogs.push({ id: makeId('log'), at: new Date().toISOString(), text: logText, registrationId: r.id });
				return { ...r, status };
			});
			const changed = newLogs.length;
			if (!changed) {
				message.warning('Không có đơn chờ duyệt trong lựa chọn.');
				return;
			}
			persist({ ...store, registrations: nextRegs, actionLogs: [...newLogs, ...store.actionLogs] });
			message.success(`Đã xử lý ${changed} đơn.`);
		},
		[store, persist],
	);

	const bulkTransferMembers = useCallback(
		(ids: string[], newClubId: string) => {
			if (!ids.length) return;
			if (!clubMap.get(newClubId)) {
				message.error('Câu lạc bộ đích không hợp lệ.');
				return;
			}
			const idSet = new Set(ids);
			const next = store.registrations.map((r) => (idSet.has(r.id) && r.status === 'approved' ? { ...r, clubId: newClubId } : r));
			persist({ ...store, registrations: next });
			message.success(`Đã chuyển ${ids.length} thành viên.`);
		},
		[store, persist, clubMap],
	);

	const stats = useMemo(() => {
		const pending = store.registrations.filter((r) => r.status === 'pending').length;
		const approved = store.registrations.filter((r) => r.status === 'approved').length;
		const rejected = store.registrations.filter((r) => r.status === 'rejected').length;
		return {
			clubCount: store.clubs.length,
			pending,
			approved,
			rejected,
			registrationTotal: store.registrations.length,
		};
	}, [store.registrations, store.clubs]);

	const chartSeries = useMemo(() => {
		const pending: number[] = [];
		const approved: number[] = [];
		const rejected: number[] = [];
		const categories: string[] = [];
		for (const c of store.clubs) {
			categories.push(c.name);
			pending.push(store.registrations.filter((r) => r.clubId === c.id && r.status === 'pending').length);
			approved.push(store.registrations.filter((r) => r.clubId === c.id && r.status === 'approved').length);
			rejected.push(store.registrations.filter((r) => r.clubId === c.id && r.status === 'rejected').length);
		}
		return {
			categories,
			series: [
				{ name: 'Chờ duyệt', data: pending },
				{ name: 'Đã duyệt', data: approved },
				{ name: 'Từ chối', data: rejected },
			],
		};
	}, [store.clubs, store.registrations]);

	const getClubName = useCallback((id: string) => clubMap.get(id)?.name ?? id, [clubMap]);

	const approvedMembers = useMemo(() => store.registrations.filter((r) => r.status === 'approved'), [store.registrations]);

	return {
		clubs: store.clubs,
		registrations: store.registrations,
		actionLogs: store.actionLogs,
		clubMap,
		approvedMembers,
		stats,
		chartSeries,
		getClubName,
		upsertClub,
		deleteClub,
		upsertRegistration,
		deleteRegistration,
		setRegistrationStatus,
		bulkSetRegistrationStatus,
		bulkTransferMembers,
	};
};

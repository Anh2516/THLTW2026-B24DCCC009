import { message } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

export type FieldType = 'String' | 'Number' | 'Date';

export type RegistryBook = {
	id: string;
	year: number;
	bookName: string;
	nextEntryNo: number;
	createdAt: string;
};

export type GraduationDecision = {
	id: string;
	decisionNo: string;
	issuedDate: string; // YYYY-MM-DD
	summary: string;
	registryBookId: string;
	lookupCount: number;
	createdAt: string;
};

export type TemplateField = {
	id: string;
	name: string;
	type: FieldType;
	required: boolean;
};

export type DiplomaRecord = {
	id: string;
	registryBookId: string;
	decisionId: string;
	entryNo: number; // so vao so, auto
	diplomaNo: string; // so hieu van bang
	studentId: string;
	fullName: string;
	dob: string; // YYYY-MM-DD
	extraValues: Record<string, string | number>;
	createdAt: string;
};

type Store = {
	registryBooks: RegistryBook[];
	decisions: GraduationDecision[];
	templateFields: TemplateField[];
	diplomas: DiplomaRecord[];
	version: 1;
};

const STORE_KEY = 'quanly_vanbang_v1';

const makeId = (p: string) => `${p}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const seedStore = (): Store => {
	const year = dayjs().year();
	const bookId = makeId('book');
	const decisionId = makeId('decision');
	return {
		version: 1,
		registryBooks: [{ id: bookId, year, bookName: `So van bang ${year}`, nextEntryNo: 1, createdAt: new Date().toISOString() }],
		decisions: [
			{
				id: decisionId,
				decisionNo: `QD-${year}-01`,
				issuedDate: `${year}-06-01`,
				summary: 'Cong nhan tot nghiep dot 1',
				registryBookId: bookId,
				lookupCount: 0,
				createdAt: new Date().toISOString(),
			},
		],
		templateFields: [
			{ id: makeId('field'), name: 'Diem trung binh', type: 'Number', required: false },
			{ id: makeId('field'), name: 'Noi sinh', type: 'String', required: false },
			{ id: makeId('field'), name: 'Ngay nhap hoc', type: 'Date', required: false },
		],
		diplomas: [],
	};
};

const parseStore = (): Store => {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		if (!raw) return seedStore();
		const parsed = JSON.parse(raw) as Store;
		if (!parsed?.version) return seedStore();
		return parsed;
	} catch {
		return seedStore();
	}
};

export default () => {
	const [store, setStore] = useState<Store>(() => parseStore());

	const persist = (next: Store) => {
		setStore(next);
		localStorage.setItem(STORE_KEY, JSON.stringify(next));
	};

	const registryBookMap = useMemo(() => new Map(store.registryBooks.map((x) => [x.id, x])), [store.registryBooks]);
	const decisionMap = useMemo(() => new Map(store.decisions.map((x) => [x.id, x])), [store.decisions]);

	const upsertRegistryBook = (payload: { id?: string; year: number; bookName: string }) => {
		const duplicateYear = store.registryBooks.find((b) => b.year === payload.year && b.id !== payload.id);
		if (duplicateYear) {
			message.error('Moi nam chi co 1 so van bang.');
			return;
		}
		if (payload.id) {
			persist({
				...store,
				registryBooks: store.registryBooks.map((x) => (x.id === payload.id ? { ...x, year: payload.year, bookName: payload.bookName } : x)),
			});
			return;
		}
		persist({
			...store,
			registryBooks: [
				...store.registryBooks,
				{ id: makeId('book'), year: payload.year, bookName: payload.bookName, nextEntryNo: 1, createdAt: new Date().toISOString() },
			],
		});
	};

	const deleteRegistryBook = (id: string) => {
		if (store.decisions.some((x) => x.registryBookId === id) || store.diplomas.some((x) => x.registryBookId === id)) {
			message.error('Khong the xoa so van bang da co du lieu lien quan.');
			return;
		}
		persist({ ...store, registryBooks: store.registryBooks.filter((x) => x.id !== id) });
	};

	const upsertDecision = (payload: { id?: string; decisionNo: string; issuedDate: string; summary: string; registryBookId: string }) => {
		if (!registryBookMap.get(payload.registryBookId)) {
			message.error('So van bang khong ton tai.');
			return;
		}
		if (payload.id) {
			persist({
				...store,
				decisions: store.decisions.map((x) =>
					x.id === payload.id ? { ...x, decisionNo: payload.decisionNo, issuedDate: payload.issuedDate, summary: payload.summary, registryBookId: payload.registryBookId } : x,
				),
			});
			return;
		}
		persist({
			...store,
			decisions: [
				...store.decisions,
				{
					id: makeId('decision'),
					decisionNo: payload.decisionNo,
					issuedDate: payload.issuedDate,
					summary: payload.summary,
					registryBookId: payload.registryBookId,
					lookupCount: 0,
					createdAt: new Date().toISOString(),
				},
			],
		});
	};

	const deleteDecision = (id: string) => {
		if (store.diplomas.some((x) => x.decisionId === id)) {
			message.error('Khong the xoa quyet dinh da co van bang.');
			return;
		}
		persist({ ...store, decisions: store.decisions.filter((x) => x.id !== id) });
	};

	const upsertTemplateField = (payload: { id?: string; name: string; type: FieldType; required: boolean }) => {
		if (payload.id) {
			persist({ ...store, templateFields: store.templateFields.map((x) => (x.id === payload.id ? { ...x, ...payload } : x)) });
			return;
		}
		persist({ ...store, templateFields: [...store.templateFields, { id: makeId('field'), ...payload }] });
	};

	const deleteTemplateField = (id: string) => {
		persist({
			...store,
			templateFields: store.templateFields.filter((x) => x.id !== id),
			diplomas: store.diplomas.map((d) => {
				const next = { ...d.extraValues };
				delete next[id];
				return { ...d, extraValues: next };
			}),
		});
	};

	const addDiploma = (payload: {
		decisionId: string;
		diplomaNo: string;
		studentId: string;
		fullName: string;
		dob: string;
		extraValues: Record<string, string | number>;
	}) => {
		const decision = decisionMap.get(payload.decisionId);
		if (!decision) {
			message.error('Quyet dinh khong ton tai.');
			return;
		}
		const book = registryBookMap.get(decision.registryBookId);
		if (!book) {
			message.error('So van bang khong ton tai.');
			return;
		}
		if (store.diplomas.some((x) => x.diplomaNo.trim().toLowerCase() === payload.diplomaNo.trim().toLowerCase())) {
			message.error('So hieu van bang da ton tai.');
			return;
		}
		const record: DiplomaRecord = {
			id: makeId('diploma'),
			registryBookId: book.id,
			decisionId: decision.id,
			entryNo: book.nextEntryNo,
			diplomaNo: payload.diplomaNo.trim(),
			studentId: payload.studentId.trim(),
			fullName: payload.fullName.trim(),
			dob: payload.dob,
			extraValues: payload.extraValues,
			createdAt: new Date().toISOString(),
		};
		persist({
			...store,
			diplomas: [record, ...store.diplomas],
			registryBooks: store.registryBooks.map((b) => (b.id === book.id ? { ...b, nextEntryNo: b.nextEntryNo + 1 } : b)),
		});
	};

	const updateDiploma = (id: string, payload: Omit<DiplomaRecord, 'id' | 'entryNo' | 'registryBookId' | 'createdAt'>) => {
		const old = store.diplomas.find((x) => x.id === id);
		if (!old) return;
		const decision = decisionMap.get(payload.decisionId);
		if (!decision) {
			message.error('Quyet dinh khong ton tai.');
			return;
		}
		if (
			store.diplomas.some((x) => x.id !== id && x.diplomaNo.trim().toLowerCase() === payload.diplomaNo.trim().toLowerCase())
		) {
			message.error('So hieu van bang da ton tai.');
			return;
		}
		persist({
			...store,
			diplomas: store.diplomas.map((x) =>
				x.id === id
					? { ...x, decisionId: payload.decisionId, diplomaNo: payload.diplomaNo, studentId: payload.studentId, fullName: payload.fullName, dob: payload.dob, extraValues: payload.extraValues }
					: x,
			),
		});
	};

	const deleteDiploma = (id: string) => persist({ ...store, diplomas: store.diplomas.filter((x) => x.id !== id) });

	const lookupDiplomas = (params: { diplomaNo?: string; entryNo?: number; studentId?: string; fullName?: string; dob?: string }) => {
		const values = [params.diplomaNo, params.entryNo, params.studentId, params.fullName, params.dob].filter(
			(v) => v !== undefined && `${v}`.trim() !== '',
		);
		if (values.length < 2) {
			message.error('Can nhap it nhat 2 tham so de tra cuu.');
			return [];
		}
		const results = store.diplomas.filter((x) => {
			if (params.diplomaNo && !x.diplomaNo.toLowerCase().includes(params.diplomaNo.toLowerCase())) return false;
			if (params.entryNo !== undefined && x.entryNo !== params.entryNo) return false;
			if (params.studentId && !x.studentId.toLowerCase().includes(params.studentId.toLowerCase())) return false;
			if (params.fullName && !x.fullName.toLowerCase().includes(params.fullName.toLowerCase())) return false;
			if (params.dob && x.dob !== params.dob) return false;
			return true;
		});

		const decisionIds = new Set(results.map((x) => x.decisionId));
		if (decisionIds.size) {
			persist({
				...store,
				decisions: store.decisions.map((d) => (decisionIds.has(d.id) ? { ...d, lookupCount: d.lookupCount + 1 } : d)),
			});
		}
		return results;
	};

	return {
		registryBooks: store.registryBooks,
		decisions: store.decisions,
		templateFields: store.templateFields,
		diplomas: store.diplomas,
		registryBookMap,
		decisionMap,
		upsertRegistryBook,
		deleteRegistryBook,
		upsertDecision,
		deleteDecision,
		upsertTemplateField,
		deleteTemplateField,
		addDiploma,
		updateDiploma,
		deleteDiploma,
		lookupDiplomas,
	};
};


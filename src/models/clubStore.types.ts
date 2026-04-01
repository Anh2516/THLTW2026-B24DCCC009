export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type Club = {
	id: string;
	avatarUrl: string;
	name: string;
	foundedAt: string;
	descriptionHtml: string;
	presidentName: string;
	active: boolean;
	createdAt: string;
};

export type Registration = {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	gender: string;
	address: string;
	strengths: string;
	clubId: string;
	reason: string;
	status: RegistrationStatus;
	notes: string;
	createdAt: string;
};

export type ActionLogEntry = {
	id: string;
	at: string;
	text: string;
	registrationId?: string;
};

export type QuanLyClubStore = {
	version: 1;
	clubs: Club[];
	registrations: Registration[];
	actionLogs: ActionLogEntry[];
};

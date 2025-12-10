import { JSONContent } from "@tiptap/react";
type UserSnapshot = {
	id: string;
	name: string;
	phone: string;
	at: Date;
};
type ServiceSnapshot = {
	id: string;
	name: string;
	description?: string;
	price: number;
	quantity: number;
};
type MedicineSnapshot = {
	id: string;
	name: string;
	description?: string;
	quantity: number;
	unit: string;
	dosage: string;
};
type DiscountSnapshot = {
	type: "fix" | "percent";
	value: number;
	description: string;
};
declare global {
	namespace PrismaJson {
		type ExaminationSessionSessionType = string[];
		type EditorContentType = JSONContent;
		type UserSnapshotType = UserSnapshot;
		type ServiceSnapshotType = ServiceSnapshot[];
		type MedicineSnapshotType = MedicineSnapshot[];
		type DiscountSnapshotType = DiscountSnapshot[];
	}
}

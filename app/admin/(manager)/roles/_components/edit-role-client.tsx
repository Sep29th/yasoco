"use client";

import {useState, useCallback} from "react";
import {useRouter} from "next/navigation";
import PermissionsClient from "./permission-client";
import {updateRoleAction} from "../_actions/update";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

type PropsType = {
	roleId: string;
	initialName: string;
	initialPermissions: string[];
};

export default function EditRoleClient({roleId, initialName, initialPermissions}: PropsType) {
	const router = useRouter();
	const [name, setName] = useState(initialName);
	const [permissions, setPermissions] = useState<string[]>(initialPermissions);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePermissionsChange = useCallback((perms: string[]) => {
		setPermissions(perms);
	}, [setPermissions]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		const trimmed = name.trim();
		if (!trimmed) {
			setError("Tên vai trò không được để trống");
			return;
		}

		setLoading(true);
		try {
			const result = await updateRoleAction({id: roleId, name: trimmed, permissions});
			if (!result.ok) setError(result.message ?? "Có lỗi xảy ra");
			else router.push("/admin/roles");
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message || "Có lỗi xảy ra");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-1">
				<div className="bg-white rounded shadow p-6 space-y-4">
					<div>
						<label htmlFor="name" className="block mb-1 text-sm font-medium">
							Tên vai trò
						</label>
						<Input
							id="name"
							name="name"
							placeholder="Ví dụ: BAC_SI"
							value={name}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<div className="flex items-center gap-2">
						<Button type="submit" className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]" disabled={loading}>
							{loading ? "Đang cập nhật..." : "Cập nhật"}
						</Button>
						<Button type="button" variant="outline" className="cursor-pointer"
										onClick={() => router.push("/admin/roles")}>
							Hủy
						</Button>
					</div>
				</div>
			</div>

			<div className="lg:col-span-2">
				<div className="bg-white rounded shadow p-6 space-y-4">
					<div className="mb-2">
						<h2 className="text-lg font-medium">Phân quyền</h2>
						<p className="text-sm text-gray-500">Chọn mức độ truy cập cho từng quyền chi tiết.</p>
					</div>

					<PermissionsClient
						onChange={handlePermissionsChange}
						includeHiddenInputs={false}
						initialPermissions={initialPermissions}
					/>
				</div>
			</div>
		</form>
	);
}


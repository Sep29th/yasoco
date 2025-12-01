"use client";
import { useState, useEffect, useRef } from "react";
import { Level } from "../_types/level";
import { inferLevelActions } from "../_utils/infer-level-action";
import { ACCESS_LEVEL_MAP, RESOURCES } from "@/lib/constants/permission";
import { permissionsToLevels } from "../_utils/permissions-to-levels";
import { Shield, Eye, Edit, Settings } from "lucide-react";
type PropsType = {
	onChange?: (permissions: string[]) => void;
	includeHiddenInputs?: boolean;
	initialPermissions?: string[];
};
export default function PermissionsClient({
	onChange,
	includeHiddenInputs,
	initialPermissions,
}: PropsType) {
	const [levels, setLevels] = useState<Record<string, Level>>(() => {
		if (initialPermissions && initialPermissions.length > 0) {
			return permissionsToLevels(initialPermissions);
		}
		const initial: Record<string, Level> = {};
		RESOURCES.forEach((r) => (initial[r.key] = null));
		return initial;
	});
	const toggleLevel = (resourceKey: string, level: Level) => {
		setLevels((prev) => ({
			...prev,
			[resourceKey]: prev[resourceKey] === level ? null : level,
		}));
	};
	const prevRef = useRef<string | null>(null);
	useEffect(() => {
		const perms: string[] = [];
		RESOURCES.forEach((res) => {
			const selectedLevel = levels[res.key];
			let activeActions: string[] = [];
			if (ACCESS_LEVEL_MAP && ACCESS_LEVEL_MAP[res.key]) {
				const map = ACCESS_LEVEL_MAP[res.key];
				if (selectedLevel === "viewer") activeActions = map.viewer ?? [];
				if (selectedLevel === "editor") activeActions = map.editor ?? [];
				if (selectedLevel === "manager") activeActions = map.manager ?? [];
			} else {
				activeActions = inferLevelActions(res.actions, selectedLevel);
			}
			activeActions.forEach((p) => perms.push(p));
		});
		const unique = Array.from(new Set(perms));
		const key = unique.join(",");
		if (key !== prevRef.current) {
			prevRef.current = key;
			onChange?.(unique);
		}
	}, [levels, onChange]);
	return (
		<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
			{RESOURCES.map((res) => {
				const selectedLevel = levels[res.key];
				let activeActions: string[] = [];
				if (ACCESS_LEVEL_MAP && ACCESS_LEVEL_MAP[res.key]) {
					const map = ACCESS_LEVEL_MAP[res.key];
					if (selectedLevel === "viewer") activeActions = map.viewer ?? [];
					if (selectedLevel === "editor") activeActions = map.editor ?? [];
					if (selectedLevel === "manager") activeActions = map.manager ?? [];
				} else {
					activeActions = inferLevelActions(res.actions, selectedLevel);
				}
				return (
					<div
						key={res.key}
						className={`border rounded-xl bg-white shadow-sm transition-all duration-200 ${
							selectedLevel
								? "ring-2 ring-[#A6CF52]/30 border-[#A6CF52]"
								: "border-gray-200"
						}`}
					>
						<div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3 className="font-semibold text-gray-900 flex items-center gap-2">
										<Shield className="w-4 h-4 text-[#A6CF52]" /> {res.label}
									</h3>
									<p className="text-sm text-gray-500 mt-1">
										{res.description}
									</p>
								</div>
							</div>
						</div>
						<div className="p-4 space-y-5">
							<div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
								<button
									type="button"
									onClick={() => toggleLevel(res.key, "viewer")}
									className={`flex items-center justify-center gap-2 py-2 text-sm font-medium cursor-pointer rounded-md transition-all ${
										selectedLevel === "viewer"
											? "bg-white text-[#A6CF52] shadow-sm ring-1 ring-[#A6CF52]/20"
											: "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
									}`}
								>
									<Eye className="w-4 h-4" /> Xem
								</button>
								<button
									type="button"
									onClick={() => toggleLevel(res.key, "editor")}
									className={`flex items-center justify-center gap-2 py-2 text-sm font-medium cursor-pointer rounded-md transition-all ${
										selectedLevel === "editor"
											? "bg-white text-[#A6CF52] shadow-sm ring-1 ring-[#A6CF52]/20"
											: "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
									}`}
								>
									<Edit className="w-4 h-4" /> Sửa
								</button>
								<button
									type="button"
									onClick={() => toggleLevel(res.key, "manager")}
									className={`flex items-center justify-center gap-2 py-2 text-sm font-medium cursor-pointer rounded-md transition-all ${
										selectedLevel === "manager"
											? "bg-white text-[#A6CF52] shadow-sm ring-1 ring-[#A6CF52]/20"
											: "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
									}`}
								>
									<Settings className="w-4 h-4" /> Quản lý
								</button>
							</div>
							<div>
								<p className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">
									Quyền chi tiết
								</p>
								<div className="flex flex-wrap gap-2">
									{res.actions.map((perm) => {
										const isChecked = activeActions.includes(perm.value);
										return (
											<div
												key={perm.value}
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors ${
													isChecked
														? "bg-[#A6CF52]/10 border-[#A6CF52]/50 text-[#A6CF52] font-semibold"
														: "bg-gray-50 border-gray-100 text-gray-400"
												}`}
											>
												<span>{perm.label}</span>
												{includeHiddenInputs && isChecked && (
													<input
														type="hidden"
														name="permissions[]"
														value={perm.value}
													/>
												)}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

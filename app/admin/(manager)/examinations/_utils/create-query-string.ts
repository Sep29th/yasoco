import { PageParams } from "@/app/admin/(manager)/examinations/_types/page-params";
export const createQueryString = (
	resolvedParams: PageParams,
	newMode: string
) => {
	const params = new URLSearchParams(resolvedParams);
	params.set("mode", newMode);
	params.delete("page");
	params.delete("error");
	return `?${params.toString()}`;
};

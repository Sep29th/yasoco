"use client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

export default function BackButton() {
	const {back} = useRouter()
	return (
		<Button variant="outline" className="cursor-pointer" onClick={back}>
			Quay lại
		</Button>
	)
}
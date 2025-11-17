import { getRoleById } from "@/lib/role";
import ModalContent from "../../../_components/modal-content";

type PropsType = {
  params: Promise<{ id: string }>;
};

export default async function RoleModal({ params }: PropsType) {
  const { id } = await params;
  const data = await getRoleById(id);

  console.log("render here")

  return <ModalContent data={data} />;
}

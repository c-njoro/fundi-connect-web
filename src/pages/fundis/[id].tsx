import { useRouter } from "next/router";

export default function FundiProfile() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  return (
    <>
      <p className="text-base">Public profile for fundi: {id}</p>
    </>
  );
}

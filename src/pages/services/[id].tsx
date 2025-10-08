import { useRouter } from "next/router";

export default function ServiceDetails() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  return (
    <>
      <p className="text-base">Details for service: {id}</p>
    </>
  );
}

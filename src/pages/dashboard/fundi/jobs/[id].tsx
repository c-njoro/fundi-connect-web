import { useRouter } from "next/router";

export default function FundiJobDetail() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  return (
    <>
      <p>Details for job {id} (fundi view)</p>
    </>
  );
}

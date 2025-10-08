import { useRouter } from "next/router";
import Layout from "../../components/Layout";

export default function FundiProfile() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  return (
    <Layout title={id ? `Fundi: ${id}` : "Fundi"}>
      <p className="text-base">Public profile for fundi: {id}</p>
    </Layout>
  );
}

import { useRouter } from "next/router";
import Layout from "../../../../components/Layout";

export default function CustomerJobDetail() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  return (
    <Layout title={id ? `Job ${id}` : "Job detail"}>
      <p>Details for job {id}</p>
    </Layout>
  );
}

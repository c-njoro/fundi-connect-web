import { useRouter } from "next/router";
import Layout from "../../components/Layout";

export default function ServiceDetails() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  return (
    <Layout title={id ? `Service: ${id}` : "Service"}>
      <p className="text-base">Details for service: {id}</p>
    </Layout>
  );
}

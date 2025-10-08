import Link from "next/link";
import Layout from "../../../../components/Layout";

export default function AvailableJobs() {
  const sample = [{ id: "101", title: "Fix roof" }];
  return (
    <Layout title="Available jobs">
      <ul>
        {sample.map((j) => (
          <li key={j.id}>
            <Link href={`/dashboard/fundi/jobs/${j.id}`} className="text-blue-600">{j.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

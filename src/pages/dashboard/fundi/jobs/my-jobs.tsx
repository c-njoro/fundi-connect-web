import Link from "next/link";
import Layout from "../../../../components/Layout";

export default function MyJobs() {
  const sample = [{ id: "201", title: "Install light" }];
  return (
    <Layout title="My jobs">
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

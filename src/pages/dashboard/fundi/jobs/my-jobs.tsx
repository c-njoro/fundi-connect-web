import Link from "next/link";

export default function MyJobs() {
  const sample = [{ id: "201", title: "Install light" }];
  return (
    <>
      <ul>
        {sample.map((j) => (
          <li key={j.id}>
            <Link href={`/dashboard/fundi/jobs/${j.id}`} className="text-blue-600">{j.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

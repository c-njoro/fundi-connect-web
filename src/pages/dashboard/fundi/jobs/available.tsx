import Link from "next/link";

export default function AvailableJobs() {
  const sample = [{ id: "101", title: "Fix roof" }];
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

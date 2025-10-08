import Link from "next/link";

export default function CustomerJobs() {
  const sample = [{ id: "1", title: "Fix sink" }];
  return (
    <>
      <ul>
        {sample.map((j) => (
          <li key={j.id}>
            <Link href={`/dashboard/customer/jobs/${j.id}`} className="text-blue-600">{j.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

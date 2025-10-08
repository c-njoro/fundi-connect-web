import Link from "next/link";

export default function Services() {
  // placeholder list
  const sample = [
    { id: "plumbing", title: "Plumbing" },
    { id: "electrical", title: "Electrical" },
  ];

  return (
    <>
      <ul className="space-y-3">
        {sample.map((s) => (
          <li key={s.id}>
            <Link href={`/services/${s.id}`} className="text-blue-600 hover:underline">{s.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

import Link from "next/link";

export default function Fundis() {
  const sample = [
    { id: "alice", name: "Alice" },
    { id: "bob", name: "Bob" },
  ];
  return (
    <>
      <p className="mb-4">Browse and search fundis who offer services in your area.</p>
      <ul className="space-y-2">
        {sample.map((f) => (
          <li key={f.id}>
            <Link href={`/fundis/${f.id}`} className="text-blue-600 hover:underline">{f.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center space-y-3">
      <h2 className="text-lg font-semibold">Trip not found</h2>
      <p className="text-sm text-zinc-600">It may have been deleted or you don’t have access (authz: own trips only).</p>
      <Link href="/trips" className="text-sm underline">Back to trips</Link>
    </div>
  );
}

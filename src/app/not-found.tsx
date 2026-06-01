import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-4 py-20 sm:px-6">
      <p className="text-sm uppercase tracking-wide text-stone-500">404</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-stone-600">
        The page you requested does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        Back to today&apos;s edition
      </Link>
    </div>
  );
}

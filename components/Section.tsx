export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 text-gray-600">{children}</div>
    </section>
  );
}

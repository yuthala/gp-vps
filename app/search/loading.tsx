export default function SearchLoading() {
  return (
    <section
      aria-label="Загрузка результатов поиска"
      className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-12"
    >
      <div className="mx-auto mb-8 h-9 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md"
          >
            <div className="mb-4 h-48 animate-pulse rounded bg-gray-200" />
            <div className="mb-2 h-5 animate-pulse rounded bg-gray-200" />
            <div className="mb-6 h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-10 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

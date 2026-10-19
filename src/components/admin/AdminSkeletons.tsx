const Bar = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`} />
);

const Header = () => (
  <div className="mb-8 space-y-2">
    <Bar className="h-4 w-40 rounded-md" />
    <Bar className="h-9 w-80 max-w-full rounded-lg" />
  </div>
);

const TableCard = ({ rows = 8 }: { rows?: number }) => (
  <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <Bar className="h-8 w-44 rounded-md" />
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Bar className="h-11 flex-1 md:w-80 rounded-2xl" />
        <Bar className="h-11 w-36 rounded-2xl" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-7 gap-4 px-4 py-4 border-b border-gray-100">
          {Array.from({ length: 7 }, (_, c) => <Bar key={c} className="h-3 w-16 rounded" />)}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="grid grid-cols-7 gap-4 items-center px-4 py-4 border-b border-gray-50">
            {Array.from({ length: 7 }, (_, c) => (
              <Bar key={c} className={`h-4 rounded ${c === 1 ? 'w-full' : c === 6 ? 'w-16 rounded-full' : 'w-3/4'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export function AdminDashboardSkeleton() {
  return (
    <div className="pb-12">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => <Bar key={i} className="min-h-[160px] rounded-xl" />)}
          </div>
          <Bar className="h-[380px] w-full rounded-[32px]" />
        </div>
        <div className="lg:col-span-5 space-y-8">
          <Bar className="h-[300px] w-full rounded-[32px]" />
          <Bar className="h-[520px] w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}

export function AdminPaymentsSkeleton() {
  return (
    <div className="pb-12">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10 items-stretch">
        <Bar className="lg:col-span-5 h-[160px] rounded-[10px]" />
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Bar key={i} className="h-[160px] rounded-[10px]" />)}
        </div>
      </div>
      <TableCard />
    </div>
  );
}

// Users and Creators share this layout: header, 4 stat cards, table.
export function AdminListSkeleton() {
  return (
    <div className="pb-12">
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[1, 2, 3, 4].map(i => <Bar key={i} className="h-[170px] sm:h-[160px] rounded-xl" />)}
      </div>
      <TableCard />
    </div>
  );
}

export function AdminRequestsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Bar className="h-9 w-72 max-w-full rounded-lg" />
        <Bar className="h-4 w-96 max-w-full rounded-md" />
      </div>
      {[1, 2, 3].map(i => <Bar key={i} className="h-[112px] w-full rounded-3xl" />)}
    </div>
  );
}

import { fetchYearBaseData } from "@/lib/api";
import { YearBaseTable } from "@/components/lims/YearBaseTable";

export default async function Home() {
  // Pure Server-Side fetch! Keeps the API key fully secure.
  const result = await fetchYearBaseData();

  return (
    <main className="min-h-screen bg-zinc-50 p-6 sm:p-12 dark:bg-black font-sans">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            LIMS Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Securely tracking year base analytics and samples.
          </p>
        </header>

        <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Year Base Operations
            </h2>
            <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400">
              {result?.data?.length || 0} Records Found
            </div>
          </div>
          
          {result && result.status && result.data ? (
            <YearBaseTable data={result.data} />
          ) : (
            <div className="p-12 text-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No Data Received</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Could not fetch the LIMS data. Ensure your API Key is correct in the <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm text-zinc-900 dark:text-zinc-100">.env.local</code> file and the server is running.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

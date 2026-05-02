import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getReportChatOverview, getReportChatsInSubquery } from "../api/mulingo";

export default function ReportsPage() {
  const [overview, setOverview] = useState([]);
  const [subquery, setSubquery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [ov, sq] = await Promise.all([
        getReportChatOverview(80).catch((e) => {
          throw new Error(e.message || "Overview failed");
        }),
        getReportChatsInSubquery(80).catch(() => []),
      ]);
      setOverview(Array.isArray(ov) ? ov : []);
      setSubquery(Array.isArray(sq) ? sq : []);
    } catch (e) {
      setError(e.message || "Could not load reports");
      setOverview([]);
      setSubquery([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1F2937] bg-[#111926]/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F2937] text-[#E5E7EB] hover:bg-[#374151] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">SQL rubric demos</p>
            <h1 className="text-lg font-semibold">Reports</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 rounded-full border border-[#374151] px-3 py-1.5 text-sm hover:bg-[#1F2937] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 space-y-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-900/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
          >
            {error}
          </motion.div>
        )}

        <section className="rounded-2xl border border-[#1F2937] bg-[#111926] overflow-hidden">
          <div className="border-b border-[#1F2937] px-4 py-3">
            <h2 className="text-base font-semibold">VIEW — my chat overview</h2>
            <p className="text-xs text-[#9CA3AF] mt-1">
              <span className="font-mono">GET /reports/my-chat-overview-view</span>
            </p>
          </div>
          <div className="overflow-x-auto chat-scrollbar">
            <table className="min-w-full text-left text-xs md:text-sm">
              {overview[0] ? (
                <thead className="bg-[#0B1120] text-[#9CA3AF]">
                  <tr>
                    {Object.keys(overview[0]).map((k) => (
                      <th key={k} className="px-3 py-2 font-medium whitespace-nowrap">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody className="divide-y divide-[#1F2937]">
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-[#9CA3AF]" colSpan={99}>
                      Loading…
                    </td>
                  </tr>
                ) : overview.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-[#9CA3AF]" colSpan={99}>
                      No rows (ensure{" "}
                      <span className="font-mono text-[#C4B5FD]">submission_extras.sql</span> ran).
                    </td>
                  </tr>
                ) : (
                  overview.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.35) }}
                      className="hover:bg-[#141c31]"
                    >
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-[#E5E7EB] whitespace-nowrap max-w-[240px] truncate">
                          {v === null || v === undefined ? "—" : String(v)}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1F2937] bg-[#111926] overflow-hidden">
          <div className="border-b border-[#1F2937] px-4 py-3">
            <h2 className="text-base font-semibold">Subquery with IN — chats for user</h2>
            <p className="text-xs text-[#9CA3AF] mt-1">
              <span className="font-mono">GET /reports/chats-in-subquery</span>
            </p>
          </div>
          <div className="overflow-x-auto chat-scrollbar">
            <table className="min-w-full text-left text-xs md:text-sm">
              {subquery[0] ? (
                <thead className="bg-[#0B1120] text-[#9CA3AF]">
                  <tr>
                    {Object.keys(subquery[0]).map((k) => (
                      <th key={k} className="px-3 py-2 font-medium whitespace-nowrap">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody className="divide-y divide-[#1F2937]">
                {!loading && subquery.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-[#9CA3AF]" colSpan={99}>
                      No rows returned.
                    </td>
                  </tr>
                ) : (
                  subquery.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.35) }}
                      className="hover:bg-[#141c31]"
                    >
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-[#E5E7EB] whitespace-nowrap max-w-[240px] truncate">
                          {v === null || v === undefined ? "—" : String(v)}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

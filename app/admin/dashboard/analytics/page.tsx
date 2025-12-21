"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FaFileAlt,
  FaEye,
  FaGlobeAmericas,
  FaRegChartBar,
  FaChrome,
  FaFirefoxBrowser,
  FaSafari,
  FaEdge,
  FaOpera,
  FaInternetExplorer,
} from "react-icons/fa";

type TrendInfo = { value: string; isPositive: boolean };
type AnalyticsBucket = "hour" | "day";
type RangePreset = "24h" | "7d" | "30d" | "custom";

type AnalyticsSummary = {
  kpis: {
    visitors: number;
    pageViews: number;
    activeTimeSec: number;
    avgActiveTimeSec: number;
  };
  series: { t: string; visitors: number; pageViews: number }[];
  topPages: { path: string; views: number; avgActiveTimeSec: number }[];
  sources: { name: string; count: number }[];
  devices: {
    deviceType: { name: string; count: number }[];
    browser: { name: string; count: number }[];
    os: { name: string; count: number }[];
  };
  geo: {
    enabled: boolean;
    countries: { name: string; count: number }[];
    cities: { name: string; count: number }[];
  };
};

// ---------- helpers ----------
const numberFormatter = new Intl.NumberFormat();

const fmtSec = (sec: number) => {
  if (!sec || sec <= 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m <= 0) return `${s}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${m}m ${s}s`;
  return `${h}h ${mm}m`;
};

function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
}
function toISO(d: Date) {
  return d.toISOString();
}
function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

const pct = (part: number, total: number) =>
  total <= 0 ? 0 : Math.round((part / total) * 1000) / 10;

const PIE_COLORS = [
  "#111827",
  "#3b82f6",
  "#a855f7",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

// ---------- Skeleton helpers ----------
const SkeletonBox: React.FC<{ className?: string }> = React.memo(function SkeletonBox({
  className = "",
}) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
});
SkeletonBox.displayName = "SkeletonBox";

// ---------- Stat Card ----------
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: TrendInfo | null;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}
const StatCard: React.FC<StatCardProps> = React.memo(function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-1">
            {loading ? (
              <SkeletonBox className="h-7 w-20" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
});
StatCard.displayName = "StatCard";

// ---------- Browser Logo ----------
const BrowserLogo: React.FC<{ name?: string }> = ({ name }) => {
  const n = (name || "").toLowerCase();

  if (n.includes("chrome")) return <FaChrome className="text-blue-600" />;
  if (n.includes("firefox")) return <FaFirefoxBrowser className="text-orange-500" />;
  if (n.includes("safari")) return <FaSafari className="text-sky-500" />;
  if (n.includes("edge")) return <FaEdge className="text-emerald-600" />;
  if (n.includes("opera")) return <FaOpera className="text-red-500" />;
  if (n.includes("ie") || n.includes("internet explorer"))
    return <FaInternetExplorer className="text-sky-700" />;

  return <FaGlobeAmericas className="text-gray-500" />;
};

// ---------- Page ----------
export default function AnalyticsPage() {
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [rangePreset, setRangePreset] = useState<RangePreset>("7d");
  const [bucket, setBucket] = useState<AnalyticsBucket>("day");
  const [tab, setTab] = useState<"traffic" | "sources" | "geo" | "devices">("traffic");
  const [deviceTab, setDeviceTab] = useState<"deviceType" | "browser" | "os">("deviceType");

  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const resolveRange = useCallback(() => {
    const now = new Date();
    if (rangePreset === "24h")
      return { from: addDays(now, -1), to: now, bucket: "hour" as AnalyticsBucket };
    if (rangePreset === "7d") return { from: addDays(now, -7), to: now, bucket };
    if (rangePreset === "30d") return { from: addDays(now, -30), to: now, bucket };

    const f = customFrom ? new Date(customFrom) : addDays(now, -7);
    const t = customTo ? new Date(customTo) : now;
    return { from: f, to: t, bucket };
  }, [rangePreset, bucket, customFrom, customTo]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const { from, to, bucket: resolvedBucket } = resolveRange();
        const qs = new URLSearchParams({
          from: toISO(from),
          to: toISO(to),
          bucket: resolvedBucket,
        });

        const res = await fetch(`/api/admin/analytics/summary?${qs.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = (await res.json()) as AnalyticsSummary;

        startTransition(() => setAnalytics(data));
      } catch (e) {
        if (isAbortError(e)) return;
        console.error(e);
        setAnalyticsError("Failed to load analytics.");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
    return () => controller.abort();
  }, [resolveRange]);

  // memo rows
  const deviceTypeRows = useMemo(() => analytics?.devices?.deviceType ?? [], [analytics]);
  const osRows = useMemo(() => analytics?.devices?.os ?? [], [analytics]);
  const browserRows = useMemo(() => analytics?.devices?.browser ?? [], [analytics]);

  const deviceTypeTotal = useMemo(
    () => deviceTypeRows.reduce((a, x) => a + (x.count || 0), 0),
    [deviceTypeRows]
  );
  const osTotal = useMemo(() => osRows.reduce((a, x) => a + (x.count || 0), 0), [osRows]);

  const deviceTypePie = useMemo(
    () => deviceTypeRows.map((r) => ({ name: r.name || "Unknown", value: r.count || 0 })),
    [deviceTypeRows]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visitors, page views, active time, sources, geo & devices
        </p>
      </div>

      {/* Controls */}
      <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={rangePreset}
              onChange={(e) => setRangePreset(e.target.value as RangePreset)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30d</option>
              <option value="custom">Custom</option>
            </select>

            {rangePreset === "custom" && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            )}

            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as AnalyticsBucket)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
              disabled={rangePreset === "24h"}
              title={rangePreset === "24h" ? "24h uses hourly buckets" : ""}
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
            </select>
          </div>

          {analyticsError && <div className="text-sm text-red-600">{analyticsError}</div>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          <StatCard
            title="Total Visitors"
            value={analyticsLoading ? "…" : numberFormatter.format(analytics?.kpis.visitors ?? 0)}
            icon={<FaEye className="text-xl text-blue-500" />}
            color="bg-blue-100"
            loading={analyticsLoading || isPending}
          />
          <StatCard
            title="Page Views"
            value={analyticsLoading ? "…" : numberFormatter.format(analytics?.kpis.pageViews ?? 0)}
            icon={<FaRegChartBar className="text-xl text-indigo-500" />}
            color="bg-indigo-100"
            loading={analyticsLoading || isPending}
          />
          <StatCard
            title="Total Active Time"
            value={analyticsLoading ? "…" : fmtSec(analytics?.kpis.activeTimeSec ?? 0)}
            icon={<FaFileAlt className="text-xl text-amber-500" />}
            color="bg-amber-100"
            loading={analyticsLoading || isPending}
          />
          <StatCard
            title="Avg Active Time"
            value={analyticsLoading ? "…" : fmtSec(analytics?.kpis.avgActiveTimeSec ?? 0)}
            icon={<FaGlobeAmericas className="text-xl text-green-500" />}
            color="bg-green-100"
            loading={analyticsLoading || isPending}
          />
        </div>

        {/* Main Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200">
          {[
            { key: "traffic", label: "Traffic" },
            { key: "sources", label: "Sources" },
            { key: "geo", label: "Geo" },
            { key: "devices", label: "Devices" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                tab === t.key
                  ? "bg-gray-50 text-gray-900 border border-gray-200 border-b-0"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pt-5">
          {analyticsLoading ? (
            <SkeletonBox className="h-[320px] w-full" />
          ) : !analytics ? (
            <div className="text-gray-500 text-sm">No analytics data</div>
          ) : tab === "traffic" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visitors */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">Visitors Over Time</h3>
                    <p className="text-xs text-gray-500 mt-1">Unique visitors trend</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaEye className="text-blue-600 text-sm" />
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analytics.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="t"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={(value) => (bucket === "hour" ? value.slice(11, 16) : value.slice(5, 10))}
                      />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [value, "Visitors"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#visitorsGradient)"
                        dot={{ stroke: "#6366f1", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Page views */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">Page Views Over Time</h3>
                    <p className="text-xs text-gray-500 mt-1">Total page views trend</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FaRegChartBar className="text-emerald-600 text-sm" />
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analytics.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="t"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={(value) => (bucket === "hour" ? value.slice(11, 16) : value.slice(5, 10))}
                      />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [value, "Page Views"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Bar dataKey="pageViews" fill="url(#pageViewsGradient)" radius={[6, 6, 0, 0]} barSize={bucket === "hour" ? 12 : 24} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Pages */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Top Performing Pages</h3>
                    <span className="text-xs text-gray-500">Sorted by views</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium">Path</th>
                        <th className="px-6 py-4 text-left font-medium">Views</th>
                        <th className="px-6 py-4 text-left font-medium">Avg Active Time</th>
                        <th className="px-6 py-4 text-left font-medium">Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {(analytics.topPages ?? []).length ? (
                        analytics.topPages.map((p, index) => (
                          <tr key={p.path} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-900 truncate max-w-xs">{p.path}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {numberFormatter.format(p.views)}
                                </span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (p.views / (analytics.topPages[0]?.views || 1)) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-sm font-medium">{fmtSec(p.avgActiveTimeSec)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    p.avgActiveTimeSec > 120
                                      ? "bg-green-500"
                                      : p.avgActiveTimeSec > 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <span className="text-sm text-gray-600">
                                  {p.avgActiveTimeSec > 120
                                    ? "High"
                                    : p.avgActiveTimeSec > 60
                                    ? "Medium"
                                    : "Low"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No page data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : tab === "sources" ? (
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Traffic Sources</h3>
                  <p className="text-xs text-gray-500 mt-1">Where your visitors are coming from</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaGlobeAmericas className="text-purple-600 text-sm" />
                </div>
              </div>

              <div className="h-[320px]">
                {analytics.sources?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.sources} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap="20%">
                      <defs>
                        <linearGradient id="sourceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [value, "Visits"]}
                      />
                      <Bar dataKey="count" fill="url(#sourceGradient)" radius={[6, 6, 0, 0]} barSize={30} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">No source data available</div>
                )}
              </div>
            </div>
          ) : tab === "geo" ? (
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-800">Geographic Distribution</h3>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaGlobeAmericas className="text-blue-600 text-sm" />
                </div>
              </div>

              {!analytics.geo?.enabled ? (
                <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-600 mb-2">Geo analytics not configured</p>
                  <p className="text-sm text-gray-500">Enable server-side IP → country/city mapping to see geographic data</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Countries */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-white">
                      <h4 className="text-sm font-semibold text-gray-800">Top Countries</h4>
                    </div>
                    <div className="p-2">
                      {(analytics.geo.countries ?? []).map((c, index) => (
                        <div key={c.name} className="flex items-center justify-between p-3 hover:bg-blue-50/30 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{c.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{numberFormatter.format(c.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cities */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50/50 to-white">
                      <h4 className="text-sm font-semibold text-gray-800">Top Cities</h4>
                    </div>
                    <div className="p-2">
                      {(analytics.geo.cities ?? []).map((c, index) => (
                        <div key={c.name} className="flex items-center justify-between p-3 hover:bg-emerald-50/30 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{c.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{numberFormatter.format(c.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Devices
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "deviceType", label: "Device Type" },
                  { key: "browser", label: "Browser" },
                  { key: "os", label: "Operating System" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setDeviceTab(t.key as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                      deviceTab === t.key
                        ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {deviceTab === "deviceType" ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">Device Types</h3>
                    <p className="text-xs text-gray-500">Distribution of device categories</p>
                  </div>

                  {deviceTypeTotal > 0 ? (
                    <div className="h-[280px] mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceTypePie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            labelLine={false}
                            label={({ name, value }) =>
                              `${name}: ${pct(value as number, deviceTypeTotal)}%`
                            }
                          >
                            {deviceTypePie.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>

                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${numberFormatter.format(value)} (${pct(value, deviceTypeTotal)}%)`,
                              name,
                            ]}
                          />
                          <Legend verticalAlign="bottom" height={26} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                      No device data
                    </div>
                  )}
                </div>
              ) : deviceTab === "browser" ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">Browser Usage</h3>
                    <p className="text-xs text-gray-500">Top browsers with icons + percentage</p>
                  </div>

                  {browserRows?.length ? (
                    <div className="mt-4 space-y-4">
                      {(() => {
                        const total = browserRows.reduce((a, x) => a + (x.count || 0), 0) || 0;
                        return browserRows.slice(0, 12).map((b, i) => {
                          const p = pct(b.count, total);
                          return (
                            <div key={`${b.name}-${i}`} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                    <BrowserLogo name={b.name} />
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900">{b.name}</div>
                                </div>

                                <div className="text-sm text-gray-700 font-medium">{p.toFixed(1)}%</div>
                              </div>

                              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${Math.min(100, p)}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                      No browser data
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">Operating Systems</h3>
                    <p className="text-xs text-gray-500">Usage distribution</p>
                  </div>

                  {osTotal > 0 ? (
                    <div className="mt-4 space-y-4">
                      {osRows.slice(0, 12).map((r, i) => {
                        const p = pct(r.count, osTotal);
                        return (
                          <div key={`${r.name}-${i}`} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-900">{r.name}</span>
                              <span className="text-gray-500">{p.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, p)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                      No OS data
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

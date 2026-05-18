import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import type { WeeklyActivityDay } from "../types";

const AI_TYPE_LABELS: Record<string, string> = {
  summary: "Summaries",
  actions: "Action items",
  title: "Title suggestions",
};

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function WeeklyChart({ days }: { days: WeeklyActivityDay[] }) {
  const maxVal = Math.max(
    1,
    ...days.map((d) => d.notes_updated + d.ai_requests),
  );

  return (
    <div className="mt-4 flex items-end justify-between gap-2">
      {days.map((day) => {
        const total = day.notes_updated + day.ai_requests;
        const height = Math.max(4, Math.round((total / maxVal) * 96));
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t bg-brand-500/80 dark:bg-brand-400/70"
                style={{ height: `${height}px` }}
                title={`${day.notes_updated} edits, ${day.ai_requests} AI runs`}
              />
            </div>
            <span className="text-[10px] text-slate-500">{formatDayLabel(day.date)}</span>
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
              {total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard(),
  });

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading dashboard…" />
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <EmptyState
        title="Could not load dashboard"
        description="Make sure the API is running, then refresh."
      />
    );
  }

  const data = dashboardQuery.data;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Productivity</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick look at your notes and AI activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active notes" value={data.total_notes} />
        <StatCard label="Archived" value={data.archived_notes} />
        <StatCard label="AI requests (7d)" value={data.ai_usage.last_7_days} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold">Weekly activity</h2>
        <p className="mt-0.5 text-xs text-slate-500">Note edits + AI runs per day</p>
        <WeeklyChart days={data.weekly_activity} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold">Recently edited</h2>
          {data.recently_edited.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No notes yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.recently_edited.map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/app/${n.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="truncate font-medium">{n.title}</span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {new Date(n.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold">Most-used tags</h2>
          {data.top_tags.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Add tags to notes to see trends.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.top_tags.map((t) => (
                <li key={t.name} className="flex items-center justify-between text-sm">
                  <span className="text-brand-700 dark:text-brand-300">#{t.name}</span>
                  <span className="text-slate-500">{t.count} notes</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold">AI usage</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {data.ai_usage.total_requests} total requests across all notes
        </p>
        {Object.keys(data.ai_usage.by_type).length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Use Assist on a note to generate summaries, actions, or titles.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {Object.entries(data.ai_usage.by_type).map(([type, count]) => (
              <li key={type} className="flex items-center justify-between text-sm">
                <span>{AI_TYPE_LABELS[type] ?? type}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

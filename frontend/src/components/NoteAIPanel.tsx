import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { getAIProviderInfo } from "../lib/aiProvider";
import type { AIJobStatus } from "../hooks/useNoteAI";
import type { AIActionsResult, AIHistoryEntry, AISummaryResult, AITitleResult } from "../types";

function ProviderBadge({ provider }: { provider: string }) {
  const info = getAIProviderInfo(provider);
  const isLocal = info.tone === "local";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        isLocal
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
      }`}
      title={info.title}
    >
      {info.label}
    </span>
  );
}

const HISTORY_TYPE_LABELS: Record<string, string> = {
  summary: "Summary",
  actions: "Action items",
  title: "Title",
};

type FeatureBlockProps = {
  label: string;
  actionLabel: string;
  status: AIJobStatus;
  provider: string | null;
  error: string | null;
  isLoading: boolean;
  loadingLabel: string;
  onGenerate: () => void;
  canGenerate: boolean;
  children: React.ReactNode;
};

function FeatureBlock({
  label,
  actionLabel,
  status,
  provider,
  error,
  isLoading,
  loadingLabel,
  onGenerate,
  canGenerate,
  children,
}: FeatureBlockProps) {
  return (
    <section className="border-b border-slate-200 py-4 last:border-0 dark:border-slate-800">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </h3>
        {status === "success" && provider ? <ProviderBadge provider={provider} /> : null}
      </div>
      <Button
        variant="secondary"
        className="mb-3 w-full text-xs"
        onClick={onGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? "Running…" : actionLabel}
      </Button>
      {isLoading ? (
        <LoadingRow label={loadingLabel} />
      ) : null}
      {status === "error" && error ? (
        <p
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {status === "success" ? children : null}
      {status === "idle" && !isLoading ? (
        <p className="text-xs text-slate-400">Based on your note title and body.</p>
      ) : null}
    </section>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div
      className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60"
      role="status"
    >
      <Spinner className="h-4 w-4 shrink-0" />
      <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
}

function SummaryCard({ data }: { data: AISummaryResult }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/60">
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{data.summary}</p>
      {data.bullets.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Key points
          </p>
          <ul className="space-y-1 border-t border-slate-100 pt-2 dark:border-slate-800">
            {data.bullets.map((b) => (
              <li
                key={b}
                className="flex gap-2 text-xs leading-relaxed text-slate-600 before:mt-1.5 before:shrink-0 before:text-slate-400 before:content-['•'] dark:text-slate-400"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ActionsResult({
  data,
  onAppendActions,
}: {
  data: AIActionsResult;
  onAppendActions: (items: { text: string }[]) => void;
}) {
  return (
    <div className="space-y-3">
      {data.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500 dark:border-slate-700">
          No action items found.
        </p>
      ) : (
        <ul className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/60">
          {data.items.map((item) => (
            <li
              key={item.text}
              className="flex gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300"
            >
              <span
                className={`mt-0.5 shrink-0 text-base leading-none ${
                  item.done ? "text-emerald-500" : "text-slate-400"
                }`}
                aria-hidden
              >
                {item.done ? "☑" : "☐"}
              </span>
              <span className={item.done ? "text-slate-500 line-through" : undefined}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )}
      {data.items.length > 0 ? (
        <Button variant="ghost" className="text-xs" onClick={() => onAppendActions(data.items)}>
          Add to note
        </Button>
      ) : null}
    </div>
  );
}

function TitleResult({
  data,
  onApplyTitle,
}: {
  data: AITitleResult;
  onApplyTitle: (title: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/60">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Suggested</p>
      <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
        {data.title}
      </p>
      <Button variant="ghost" className="text-xs" onClick={() => onApplyTitle(data.title)}>
        Use this title
      </Button>
    </div>
  );
}

function HistoryList({ entries }: { entries: AIHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-slate-400">No assist runs yet.</p>;
  }
  return (
    <ul className="max-h-44 space-y-2 overflow-y-auto text-xs">
      {entries.map((entry) => {
        const info = getAIProviderInfo(entry.provider);
        return (
          <li
            key={entry.id}
            className="rounded-md border border-slate-200 px-2.5 py-2 dark:border-slate-700"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {HISTORY_TYPE_LABELS[entry.type] ?? entry.type}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  info.tone === "local"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                }`}
                title={info.title}
              >
                {info.label}
              </span>
            </div>
            <span className="mt-0.5 block text-slate-400">
              {new Date(entry.created_at).toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

type Props = {
  summary: {
    status: AIJobStatus;
    data: AISummaryResult | null;
    provider: string | null;
    error: string | null;
  };
  actions: {
    status: AIJobStatus;
    data: AIActionsResult | null;
    provider: string | null;
    error: string | null;
  };
  title: {
    status: AIJobStatus;
    data: AITitleResult | null;
    provider: string | null;
    error: string | null;
  };
  showHistory: boolean;
  onToggleHistory: () => void;
  history: AIHistoryEntry[];
  isHistoryLoading: boolean;
  isHistoryError: boolean;
  isSummaryLoading: boolean;
  isActionsLoading: boolean;
  isTitleLoading: boolean;
  hasContent: boolean;
  onGenerateSummary: () => void;
  onGenerateActions: () => void;
  onGenerateTitle: () => void;
  onApplyTitle: (title: string) => void;
  onAppendActions: (items: { text: string }[]) => void;
};

export function NoteAIPanel({
  summary,
  actions,
  title,
  showHistory,
  onToggleHistory,
  history,
  isHistoryLoading,
  isHistoryError,
  isSummaryLoading,
  isActionsLoading,
  isTitleLoading,
  hasContent,
  onGenerateSummary,
  onGenerateActions,
  onGenerateTitle,
  onApplyTitle,
  onAppendActions,
}: Props) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 lg:w-80 lg:border-l lg:border-t-0">
      <div className="border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Assist</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Summaries, action items, and title suggestions from your note.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {!hasContent ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Add note content to use Assist.
          </p>
        ) : (
          <>
            <FeatureBlock
              label="Summary"
              actionLabel="Summarize"
              status={summary.status}
              provider={summary.provider}
              error={summary.error}
              isLoading={isSummaryLoading}
              loadingLabel="Summarizing…"
              onGenerate={onGenerateSummary}
              canGenerate={hasContent}
            >
              {summary.data ? <SummaryCard data={summary.data} /> : null}
            </FeatureBlock>

            <FeatureBlock
              label="Action items"
              actionLabel="Find action items"
              status={actions.status}
              provider={actions.provider}
              error={actions.error}
              isLoading={isActionsLoading}
              loadingLabel="Finding action items…"
              onGenerate={onGenerateActions}
              canGenerate={hasContent}
            >
              {actions.data ? (
                <ActionsResult data={actions.data} onAppendActions={onAppendActions} />
              ) : null}
            </FeatureBlock>

            <FeatureBlock
              label="Title"
              actionLabel="Suggest title"
              status={title.status}
              provider={title.provider}
              error={title.error}
              isLoading={isTitleLoading}
              loadingLabel="Suggesting title…"
              onGenerate={onGenerateTitle}
              canGenerate={hasContent}
            >
              {title.data ? <TitleResult data={title.data} onApplyTitle={onApplyTitle} /> : null}
            </FeatureBlock>
          </>
        )}

        <section className="border-t border-slate-200 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleHistory}
            className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {showHistory ? "Hide history" : "Show history"}
          </button>
          {showHistory ? (
            isHistoryLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner className="h-4 w-4" />
                <span className="text-xs text-slate-400">Loading…</span>
              </div>
            ) : isHistoryError ? (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                Could not load assist history.
              </p>
            ) : (
              <HistoryList entries={history} />
            )
          ) : null}
        </section>
      </div>
    </aside>
  );
}

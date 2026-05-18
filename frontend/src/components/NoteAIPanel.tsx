import { Button } from "./Button";
import { Spinner } from "./Spinner";
import type { AIJobStatus } from "../hooks/useNoteAI";
import type { AIActionsResult, AIHistoryEntry, AISummaryResult, AITitleResult } from "../types";

type FeatureBlockProps = {
  label: string;
  status: AIJobStatus;
  provider: string | null;
  error: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  children: React.ReactNode;
};

function FeatureBlock({
  label,
  status,
  provider,
  error,
  isLoading,
  onGenerate,
  canGenerate,
  children,
}: FeatureBlockProps) {
  return (
    <section className="border-b border-slate-200 py-4 last:border-0 dark:border-slate-800">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h3>
        {provider ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:bg-slate-800">
            {provider}
          </span>
        ) : null}
      </div>
      <Button
        variant="secondary"
        className="mb-3 w-full text-xs"
        onClick={onGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? "Working…" : `Generate ${label.toLowerCase()}`}
      </Button>
      {isLoading ? <Spinner label="Analyzing note…" className="h-4 w-4" /> : null}
      {status === "error" && error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {status === "success" ? children : null}
      {status === "idle" && !isLoading ? (
        <p className="text-xs text-slate-400">Uses your current note text.</p>
      ) : null}
    </section>
  );
}

function HistoryList({ entries }: { entries: AIHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-slate-400">No generations yet for this note.</p>;
  }
  return (
    <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700"
        >
          <span className="font-medium capitalize">{entry.type}</span>
          <span className="text-slate-400"> · {entry.provider}</span>
          <span className="block text-slate-400">
            {new Date(entry.created_at).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        </li>
      ))}
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
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Assist</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Summaries, tasks, and titles from your note — works offline with local rules.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {!hasContent ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Add some note content to use Assist.
          </p>
        ) : (
          <>
            <FeatureBlock
              label="Summary"
              status={summary.status}
              provider={summary.provider}
              error={summary.error}
              isLoading={isSummaryLoading}
              onGenerate={onGenerateSummary}
              canGenerate={hasContent}
            >
              {summary.data ? (
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <p>{summary.data.summary}</p>
                  {summary.data.bullets.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {summary.data.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </FeatureBlock>

            <FeatureBlock
              label="Action items"
              status={actions.status}
              provider={actions.provider}
              error={actions.error}
              isLoading={isActionsLoading}
              onGenerate={onGenerateActions}
              canGenerate={hasContent}
            >
              {actions.data ? (
                <div className="space-y-2">
                  {actions.data.items.length === 0 ? (
                    <p className="text-sm text-slate-500">No action items found in this note.</p>
                  ) : (
                    <ul className="space-y-1.5 text-sm">
                      {actions.data.items.map((item) => (
                        <li
                          key={item.text}
                          className="flex gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <span className="text-slate-400" aria-hidden>
                            ☐
                          </span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {actions.data.items.length > 0 ? (
                    <Button
                      variant="ghost"
                      className="text-xs"
                      onClick={() => onAppendActions(actions.data!.items)}
                    >
                      Add to note
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </FeatureBlock>

            <FeatureBlock
              label="Title"
              status={title.status}
              provider={title.provider}
              error={title.error}
              isLoading={isTitleLoading}
              onGenerate={onGenerateTitle}
              canGenerate={hasContent}
            >
              {title.data ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {title.data.title}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-xs"
                    onClick={() => onApplyTitle(title.data!.title)}
                  >
                    Use this title
                  </Button>
                </div>
              ) : null}
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
              <Spinner className="h-4 w-4" />
            ) : (
              <HistoryList entries={history} />
            )
          ) : null}
        </section>
      </div>
    </aside>
  );
}

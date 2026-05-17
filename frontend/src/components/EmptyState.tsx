type Props = { title: string; description: string; action?: React.ReactNode };

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

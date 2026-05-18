import { Spinner } from "./Spinner";

type Props = {
  label?: string;
  className?: string;
};

/** Centered loading region with stable min-height to limit layout shift. */
export function LoadingPlaceholder({ label, className = "" }: Props) {
  return (
    <div
      className={`flex min-h-[14rem] flex-1 items-center justify-center ${className}`}
      aria-busy="true"
    >
      <Spinner label={label} />
    </div>
  );
}

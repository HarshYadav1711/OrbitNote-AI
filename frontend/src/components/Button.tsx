import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const styles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100",
  ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

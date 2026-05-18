import { Button } from "./Button";
import { useUIStore } from "../store/uiStore";

type Props = {
  className?: string;
};

export function ThemeToggle({ className = "" }: Props) {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <Button
      variant="ghost"
      onClick={toggleDarkMode}
      aria-pressed={darkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {darkMode ? "Light" : "Dark"}
    </Button>
  );
}

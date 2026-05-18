const { spawn } = require("child_process");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");
const isWin = process.platform === "win32";
const python = path.join(backendDir, ".venv", isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python");
const port = process.env.PORT || "8000";

const child = spawn(
  python,
  ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port],
  {
    cwd: backendDir,
    stdio: "inherit",
    shell: false,
    windowsHide: true,
    env: { ...process.env },
  },
);

child.on("exit", (code) => process.exit(code ?? 1));

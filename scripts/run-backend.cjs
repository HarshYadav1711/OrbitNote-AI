const { spawn } = require("child_process");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");
const isWin = process.platform === "win32";
const python = path.join(backendDir, ".venv", isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python");

const child = spawn(python, ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: false,
  windowsHide: true,
});

child.on("exit", (code) => process.exit(code ?? 1));

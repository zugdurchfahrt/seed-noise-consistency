import os, subprocess
from mcp.server import MCPServer


mcp = MCPServer("sunami-runner")

@mcp.tool()
def run_main() -> dict:
    env = os.environ.copy()
    env["PATH"] = r"C:\venvs\myproj\Scripts;" + env["PATH"]

    p = subprocess.run(
        [
            r"C:\venvs\myproj\Scripts\python.exe",
            "-u",
            r"C:\55555\switch\sunami\main.py",
        ],
        env=env,
        capture_output=True,
        text=True,
        cwd=r"C:\55555\switch\sunami",
    )
    return {"returncode": p.returncode, "stdout": p.stdout, "stderr": p.stderr}



def main():
    # Запускаем MCP-сервер и ждём команд клиента (Codex)
    mcp.run()

if __name__ == "__main__":
    main()

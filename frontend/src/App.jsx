
import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import MazeControls from "./components/MazeControls";
import MazeGrid from "./components/MazeGrid";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function App() {
  const [rows, setRows] = useState("15");
  const [columns, setColumns] = useState("15");
  const [maze, setMaze] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  // Check whether the Python backend is running.
  useEffect(() => {
    const controller = new AbortController();

    async function checkApi() {
      try {
        const response = await fetch(`${API_BASE}/health`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Health check failed");
        }

        setApiStatus("connected");
      } catch {
        if (!controller.signal.aborted) {
          setApiStatus("offline");
        }
      }
    }

    checkApi();

    return () => controller.abort();
  }, []);

  async function handleGenerate(event) {
    event.preventDefault();

    const rowCount = Number(rows);
    const columnCount = Number(columns);

    if (
      !Number.isInteger(rowCount) ||
      !Number.isInteger(columnCount) ||
      rowCount < 5 ||
      rowCount > 50 ||
      columnCount < 5 ||
      columnCount > 50
    ) {
      setError(
        "Rows and columns must be whole numbers between 5 and 50."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/mazes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: rowCount,
          columns: columnCount,
          algorithm: "recursive_backtracker",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : `Request failed with status ${response.status}.`;

        throw new Error(detail);
      }

      const grid = data?.grid;
      const gridWidth = Array.isArray(grid?.[0])
        ? grid[0].length
        : 0;

      const validGrid =
        Array.isArray(grid) &&
        grid.length > 0 &&
        gridWidth > 0 &&
        grid.every(
          (row) =>
            Array.isArray(row) &&
            row.length === gridWidth &&
            row.every((cell) => cell === 0 || cell === 1)
        );

      if (!validGrid) {
        throw new Error(
          "The API returned an invalid grid. Expected a rectangular array of 0s and 1s."
        );
      }

      setMaze(data);
      setApiStatus("connected");
    } catch (err) {
      if (err instanceof TypeError) {
        setApiStatus("offline");
        setError(
          `Cannot reach ${API_BASE}. Start Django and check its CORS configuration.`
        );
      } else {
        setError(err.message || "Maze generation failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Header apiStatus={apiStatus} />

      <main className="main-content">
        <section className="page-intro">
          <div>
            <p className="section-kicker">
              PYTHON BACKEND / PROJECT 01
            </p>

            <h1>Maze generator</h1>

            <p className="intro-description">
              Configure a maze, generate it through the API,
              and inspect the result.
            </p>
          </div>

          <div className="endpoint-info">
            <span>GENERATION ENDPOINT</span>
            <code>POST /api/mazes</code>
          </div>
        </section>

        <div className="workspace-layout">
          <aside className="sidebar">
            <MazeControls
              rows={rows}
              setRows={setRows}
              columns={columns}
              setColumns={setColumns}
              onSubmit={handleGenerate}
              loading={loading}
            />

            {error && (
              <div className="error-panel" role="alert">
                <strong>Request failed</strong>
                <p>{error}</p>
              </div>
            )}
          </aside>

          <section className="preview-panel">
            <div className="preview-header">
              <div>
                <p className="section-kicker">OUTPUT</p>
                <h2>Maze preview</h2>
              </div>

              {maze ? (
                <div className="maze-stats">
                  <span className="stat-tag">
                    {maze.rows} × {maze.columns} cells
                  </span>

                  {typeof maze.generation_ms === "number" && (
                    <span className="stat-tag">
                      {maze.generation_ms.toFixed(1)} ms
                    </span>
                  )}
                </div>
              ) : (
                <span className="pending-label">
                  AWAITING GENERATION
                </span>
              )}
            </div>

            <div className="maze-stage">
              <MazeGrid maze={maze} />
            </div>

            <div className="preview-footer">
              <div className="legend">
                <span>
                  <i className="legend-swatch swatch-wall" />
                  Wall
                </span>

                <span>
                  <i className="legend-swatch swatch-passage" />
                  Passage
                </span>

                <span>
                  <i className="legend-swatch swatch-start" />
                  Start
                </span>

                <span>
                  <i className="legend-swatch swatch-exit" />
                  Exit
                </span>
              </div>

              <span className="response-label">
                JSON → GRID
              </span>
            </div>
          </section>
        </div>

        <footer className="page-footer">
          <span>MAZE LAB</span>
          <span>React frontend · Django backend</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

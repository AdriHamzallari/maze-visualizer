
function MazeControls({
  rows,
  setRows,
  columns,
  setColumns,
  onSubmit,
  loading,
}) {
  return (
    <form className="controls-panel" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <p className="section-kicker">CONFIGURATION</p>
          <h2>New maze</h2>
        </div>

        <span className="panel-index">01</span>
      </div>

      <p className="panel-description">
        Choose the dimensions for your next maze.
      </p>

      <div className="field-grid">
        <label className="field" htmlFor="maze-rows">
          <span>Rows</span>
          <input
            id="maze-rows"
            type="number"
            min="5"
            max="50"
            step="1"
            required
            value={rows}
            onChange={(event) => setRows(event.target.value)}
          />
        </label>

        <label className="field" htmlFor="maze-columns">
          <span>Columns</span>
          <input
            id="maze-columns"
            type="number"
            min="5"
            max="50"
            step="1"
            required
            value={columns}
            onChange={(event) => setColumns(event.target.value)}
          />
        </label>
      </div>

      <div className="field">
        <span className="field-label">Algorithm</span>

        <div className="algorithm-display">
          <span className="algorithm-dot" />
          <span>Recursive backtracker</span>
          <span className="algorithm-tag">DEFAULT</span>
        </div>

        <p className="field-help">
          We'll add more algorithms once the API is working.
        </p>
      </div>

      <button
        className="generate-button"
        type="submit"
        disabled={loading}
      >
        <span>
          {loading ? "Generating..." : "Generate maze"}
        </span>
        <span aria-hidden="true">
          {loading ? "…" : "→"}
        </span>
      </button>

      <p className="field-note">
        Dimensions must be between 5 and 50.
      </p>
    </form>
  );
}

export default MazeControls;

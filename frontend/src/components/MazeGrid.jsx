
function MazeGrid({ maze }) {
  if (!maze) {
    return (
      <div className="empty-state">
        <span className="empty-kicker">NO OUTPUT YET</span>

        <h3>Your maze will appear here.</h3>

        <p>
          Configure the dimensions and send a request
          to the Python API to generate your first maze.
        </p>
      </div>
    );
  }

  const grid = maze.grid;
  const gridRows = grid.length;
  const gridColumns = grid[0].length;

  // Keep the preview readable for both wide and tall mazes.
  const previewWidth = Math.min(
    720,
    560 * gridColumns / gridRows
  );

  return (
    <div className="maze-scroll">
      <div
        className="maze-grid"
        role="img"
        aria-label={`Maze with ${maze.rows} rows and ${maze.columns} columns`}
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
          width: `${previewWidth}px`,
          aspectRatio: `${gridColumns} / ${gridRows}`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const isStart =
              rowIndex === 1 && columnIndex === 1;

            const isExit =
              rowIndex === gridRows - 2 &&
              columnIndex === gridColumns - 2;

            const classes = [
              "maze-cell",
              cell === 1
                ? "maze-cell--wall"
                : "maze-cell--passage",
              cell === 0 && isStart
                ? "maze-cell--start"
                : "",
              cell === 0 && isExit
                ? "maze-cell--exit"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className={classes}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default MazeGrid;

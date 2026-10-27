from gen import GenerateMaze


def maze_to_grid(maze):
    rows = maze.width
    columns = maze.height
    grid = [
        [1 for _ in range(2 * columns + 1)]
        for _ in range(2 * rows + 1)]

    for cell in maze.list_cells:
        x = cell.x
        y = cell.y
        grid[2 * x + 1][2 * y + 1] = 0
        if not cell.walls["N"]:
            grid[2 * x][2 * y + 1] = 0
        if not cell.walls["S"]:
            grid[2 * x + 2][2 * y + 1] = 0
        if not cell.walls["W"]:
            grid[2 * x + 1][2 * y] = 0
        if not cell.walls["E"]:
            grid[2 * x + 1][2 * y + 2] = 0
    return grid


maze = GenerateMaze(2, 2, seed=12)

maze.save_nghb()

start = maze.get_cell(0, 0)
maze.dfs(start)
maze.save_walls()

print(maze_to_grid(maze))

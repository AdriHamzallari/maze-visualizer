from django.shortcuts import render
from django.http import JsonResponse
from .conversion import maze_to_grid
from gen import GenerateMaze
from django.views.decorators.csrf import csrf_exempt
import json
# Create your views here.


def health(request):
    data = {
        'status': "OK"
    }
    return JsonResponse(data)


@csrf_exempt
def generate_maze(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"},  status=405)
    try:
        data = json.loads(request.body)
        if not isinstance(data, dict):
            return JsonResponse({"detail": "Data is not a dict"}, status=400)
        all_keys = data.keys()
        if "rows" not in all_keys or "columns" not in all_keys or "algorithm" not in all_keys:
            return JsonResponse({"detail": "A requried data is missing."},
                                status=400)
        rows = data["rows"]
        columns = data["columns"]
        algorithm = data.get("algorithm")

        if algorithm != "recursive_backtracker":
            return JsonResponse({"detail": "Unsupported algorithm"},
                                status=400,)
        if not isinstance(rows, int) or not isinstance(columns, int):
            return JsonResponse({'detail': "Data must be intiger"}, status=400)
        
        if rows < 5 or columns < 5:
            return JsonResponse({'detail': "Values must be between 5 and 50,"
                                " inclusive."},
                                status=400)
        if rows > 50 or columns > 50:
            return JsonResponse({'detail': "Values must be between 5 and 50,"
                                " inclusive."},
                                status=400)
        maze = GenerateMaze(rows, columns, seed=None)
        maze.save_nghb()
        start = maze.get_cell(0, 0)
        maze.dfs(start)
        maze.save_walls()

        grid = maze_to_grid(maze)

        return JsonResponse({
            "rows": rows,
            "columns": columns,
            "grid": grid,
        })
    except json.JSONDecodeError:
        return JsonResponse({"detail": "JSON is malformed"}, status=400)

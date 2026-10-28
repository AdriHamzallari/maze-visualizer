# Maze Lab

Maze Lab is a web application for generating and visualizing mazes. It combines a React frontend with a Django backend and a Python maze-generation engine.

Users can configure the dimensions of a maze, request a new maze from the backend, and view the generated result directly in the browser.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Frontend](#frontend)
- [Backend](#backend)
- [Maze Generation](#maze-generation)
- [API Reference](#api-reference)
- [Input Validation and Error Handling](#input-validation-and-error-handling)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Running the Tests](#running-the-tests)
- [Technical Notes](#technical-notes)

## Overview

Maze Lab separates the user interface, HTTP API, and maze-generation logic into distinct parts.

The frontend is responsible for collecting user input, sending requests, displaying results, and communicating errors. The backend receives requests, validates the supplied data, invokes the maze generator, converts the generated maze into a grid representation, and returns the result as JSON.

This separation allows the frontend and backend to communicate through a defined API rather than sharing application logic directly.

## Features

- Generate mazes using the recursive backtracking algorithm.
- Configure the number of rows and columns.
- Validate maze dimensions before sending requests.
- Generate mazes through a Django HTTP API.
- Represent the maze as a two-dimensional grid of integers.
- Display the generated maze in the React interface.
- Check backend availability through a health endpoint.
- Handle malformed JSON, missing fields, unsupported algorithms, and invalid dimensions.
- Test API behavior using Django's testing framework.

## Technologies

| Technology | Purpose |
|---|---|
| React | Builds the user interface |
| JavaScript | Handles frontend behavior and API requests |
| Vite | Runs the frontend development server |
| CSS | Styles the interface |
| Python | Implements the backend integration and maze-generation logic |
| Django | Provides HTTP endpoints and request handling |
| django-cors-headers | Configures cross-origin requests during development |
| Python `json` module | Parses incoming JSON request bodies |
| Django `JsonResponse` | Returns JSON responses to the frontend |
| Django TestCase | Tests backend behavior |

## Project Structure

The project is organized into separate frontend and backend directories.

```text
maze-gen/
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   │
│   ├── mazes/
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── conversion.py
│   │   └── test.py
│   │
│   ├── manage.py
│   ├── .venv/
│   └── ...
│
└── .gitignore
```

The structure above highlights the main files involved in the application. Some generated or environment-specific files have been omitted.

### Important files

**Frontend**

- `frontend/src/App.jsx`: Contains the main React interface, API configuration, request handling, input validation, and maze rendering.

**Backend**

- `backend/config/settings.py`: Contains Django settings, installed applications, middleware, and CORS configuration.
- `backend/config/urls.py`: Connects the main Django URL configuration to the maze application.
- `backend/mazes/urls.py`: Defines the maze API and health-check routes.
- `backend/mazes/views.py`: Implements the HTTP endpoints, request validation, maze-generation workflow, and JSON responses.
- `backend/mazes/conversion.py`: Converts the generated maze into the grid format expected by the frontend.
- `backend/mazes/test.py`: Contains automated tests for backend functionality.

## How It Works

The application follows this sequence when a user generates a maze:

1. The user selects the desired number of rows and columns.
2. The React frontend validates the input.
3. The frontend sends an HTTP POST request to Django containing the dimensions and selected algorithm.
4. Django parses the JSON body and validates its structure and values.
5. The backend initializes the maze generator and runs the recursive backtracking algorithm.
6. The generated maze is converted into a two-dimensional grid.
7. Django returns the dimensions and grid in a JSON response.
8. React validates the returned grid and renders the maze.

The general request flow is:

```text
User
 |
 v
React Frontend
 |
 | POST /api/mazes
 v
Django API
 |
 | Validate request
 v
Maze Generator
 |
 | Generate maze
 v
Grid Conversion
 |
 | JSON response
 v
React Frontend
 |
 v
Rendered Maze
```

## Frontend

The frontend is built with React and runs through Vite.

Its main responsibilities are:

- Collecting maze dimensions from the user.
- Validating dimensions before making an API request.
- Sending HTTP requests to the Django backend.
- Handling successful responses and API errors.
- Checking that the returned grid is rectangular and contains only valid integer cell values.
- Rendering the maze in the browser.
- Reporting connection problems when the backend cannot be reached.

### API configuration

The frontend uses an environment variable to configure the backend address:

```javascript
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
```

This allows the backend URL to be changed without modifying the API request logic.

For local development, the frontend uses:

```text
http://127.0.0.1:8000
```

The `VITE_API_URL` environment variable can override this default.

### Generating a maze

When the user requests a maze, the frontend sends a POST request to:

```text
/api/mazes
```

The request body contains the requested dimensions and algorithm:

```json
{
  "rows": 15,
  "columns": 15,
  "algorithm": "recursive_backtracker"
}
```

The frontend then processes the response and displays the generated maze.

## Backend

The backend uses Django to expose HTTP endpoints and connect the frontend to the maze-generation engine.

### URL routing

The main URL configuration includes the maze application's routes. The maze application's URL configuration defines two endpoints:

```python
urlpatterns = [
    path("health", health),
    path("api/mazes", generate_maze),
]
```

The routes do not require a trailing slash.

### Health endpoint

The health endpoint is available at:

```http
GET /health
```

A successful response is:

```json
{
  "status": "OK"
}
```

This endpoint provides a simple way to check whether the backend is responding.

### Maze-generation endpoint

The maze-generation endpoint is available at:

```http
POST /api/mazes
Content-Type: application/json
```

It accepts the requested dimensions and algorithm, validates the input, generates the maze, converts it into a grid, and returns the result.

A successful response contains the following fields:

```json
{
  "rows": 5,
  "columns": 5,
  "grid": [
    [1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1]
  ]
}
```

This is an illustrative response showing the grid format, not a guarantee of a particular generated maze. The actual grid depends on the generated maze.

## Maze Generation

The maze-generation logic is implemented separately from Django's HTTP request handling.

The backend imports the generator through:

```python
from gen import GenerateMaze
```

The generator is initialized with the requested dimensions and an optional seed:

```python
maze = GenerateMaze(rows, columns, seed=None)
```

The generation workflow follows these steps:

```python
maze.save_nghb()

start = maze.get_cell(0, 0)
maze.dfs(start)

maze.save_walls()
```

The operations have distinct responsibilities:

- `save_nghb()` prepares the neighborhood relationships between cells.
- `get_cell(0, 0)` retrieves the starting cell.
- `dfs(start)` runs depth-first search to carve the maze using recursive backtracking.
- `save_walls()` records the resulting wall structure.

The order matters because the algorithm relies on the cell relationships established before traversal. Reinitializing the neighborhood relationships after running DFS could overwrite the connections created during generation.

### Grid conversion

The generated maze is converted into a two-dimensional grid by `maze_to_grid()` in `conversion.py`.

The logical maze dimensions are not the same as the dimensions of the rendered grid. Walls and passages require additional positions in the output representation.

For a logical maze with \(r\) rows and \(c\) columns, the output grid has:

\[
(2r+1)\times(2c+1)
\]

For example, a logical maze of 10 rows and 10 columns produces a grid with 21 rows and 21 columns.

The grid uses integer values:

- `1`: wall.
- `0`: open passage.

This representation allows the frontend to render walls and passages using a simple two-dimensional array.

## API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Checks backend availability |
| `/api/mazes` | POST | Generates a maze |

### Maze request fields

| Field | Type | Description |
|---|---|---|
| `rows` | Integer | Number of logical maze rows, from 5 to 50 |
| `columns` | Integer | Number of logical maze columns, from 5 to 50 |
| `algorithm` | String | Currently supported value: `recursive_backtracker` |

### Response fields

| Field | Type | Description |
|---|---|---|
| `rows` | Integer | Requested logical row count |
| `columns` | Integer | Requested logical column count |
| `grid` | Two-dimensional integer array | Generated maze representation |

## Input Validation and Error Handling

The backend validates incoming requests before starting maze generation.

The validation covers:

- Malformed JSON.
- A request body that is not a JSON object.
- Missing required fields.
- An unsupported algorithm.
- Row or column values that are not integers.
- Dimensions outside the inclusive range of 5 to 50.
- Requests using an unsupported HTTP method.

The endpoint returns an error response with a `detail` field when validation fails.

Examples of HTTP status codes used by the API:

| Status code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `400 Bad Request` | Invalid input or malformed request |
| `405 Method Not Allowed` | Unsupported HTTP method |

The frontend also validates user input and checks the structure of the returned grid. These checks help catch invalid data before rendering it.

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Python 3.
- Node.js and npm.
- Git.

The backend also requires the Python packages used by the project, including Django, `django-cors-headers`, and the maze-generator package.

### 1. Clone the repository

```bash
git clone <repository-url>
cd maze-gen
```

Replace `<repository-url>` with the URL of the repository.

### 2. Set up the backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv .venv
```

Activate it on Linux or macOS:

```bash
source .venv/bin/activate
```

Install the backend dependencies.

If the repository contains a `requirements.txt` file, use:

```bash
pip install -r requirements.txt
```

If there is no requirements file, install the project's dependencies according to its actual package configuration. The environment used during development included Django, `django-cors-headers`, and `mazegen==1.0.0`.

Return to the repository root when the backend environment is ready:

```bash
cd ..
```

### 3. Set up the frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install the Node.js dependencies:

```bash
npm install
```

If the project is configured for another package manager, use the lockfile and package manager supplied by the repository instead.

### 4. Configure the backend URL

By default, the frontend connects to:

```text
http://127.0.0.1:8000
```

For a different backend address, create a `.env` file in the frontend directory:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Change the URL if the backend runs at a different address. Restart the Vite development server after changing environment variables.

## Running the Application

The frontend and backend run as separate development servers.

### 1. Start Django

Open a terminal:

```bash
cd backend
source .venv/bin/activate
python3 manage.py runserver
```

Django should be available at:

```text
http://127.0.0.1:8000
```

You can verify the health endpoint by opening:

```text
http://127.0.0.1:8000/health
```

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Vite will display the local development URL in the terminal, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

### 3. Generate a maze

1. Open the frontend.
2. Enter the desired number of rows and columns within the supported range.
3. Request maze generation.
4. Wait for the backend response.
5. View the generated maze in the interface.

Keep both development servers running while using the application.

## Running the Tests

The backend includes automated tests implemented with Django's testing framework.

From the backend directory, activate the virtual environment and run:

```bash
python3 manage.py test
```

The test suite checks backend behavior, including successful maze generation, request validation, and endpoint behavior.

The current test suite contains three test methods. All three passed during the latest verification:

```text
Found 3 test(s).
System check identified no issues (0 silenced).
...
Ran 3 tests in 0.047s

OK
```

Passing tests confirm that the covered scenarios work as expected. They do not guarantee that every possible input or environment has been tested.

## Technical Notes

### CORS configuration

The Django backend uses `django-cors-headers` to permit requests from the local frontend development origins:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

CORS controls which browser origins may make cross-origin requests. It is not an authentication or authorization mechanism.

If the frontend is served from another origin, the CORS configuration must be updated accordingly.

### CSRF protection

The maze-generation endpoint is currently exempt from Django's CSRF protection because the application exposes a simple API without a login or session-authentication flow.

If session-based authentication or other state-changing operations are introduced, the security configuration should be reviewed before expanding the application.

### Git and virtual environments

The project includes a `.gitignore` file to prevent local development artifacts, such as Python bytecode and the virtual environment, from being tracked.

The virtual environment contains locally installed Python dependencies and should be recreated on another machine rather than committed to the repository.

## License

No license has been specified for this project. If you intend to distribute the source code publicly, add an appropriate license file.

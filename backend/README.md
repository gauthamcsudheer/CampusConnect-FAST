# CampusConnect Backend

This is the backend API for the CampusConnect application built with FastAPI.

## Setup

1. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Application

To run the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative API docs (ReDoc): `http://localhost:8000/redoc`

## Available Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint
- `GET /api/v1/users/`: List all users
- `POST /api/v1/users/`: Create a new user
- `GET /api/v1/users/{user_id}`: Get a specific user

# LifeTracker

A productivity and focus tracking app with an AI-powered assistant, built using Vue 3 (client) and Node.js/Express (server).

---

## Features

- Task management and analytics
- AI assistant for productivity advice (Trinity AI integration)
- User authentication (JWT)
- Data visualization (charts, maps)
- PostgreSQL database

## Architecture
LifeTracker Project Architecture 
Client (Vue 3 Frontend):

App.vue — The main application component.
main.js — Entry point that initializes the app.
components/ — Reusable UI components (e.g., AI Assistant, Analytics Chart, Map View).
views/ — Main page views (Dashboard, Login, Profile, Register).
router/index.js — Handles navigation between views.
services/api.js — Centralized API service for making HTTP requests to the backend.
stores/ — State management (using Pinia) for tasks, UI state, and user data.
How it works:
The frontend is responsible for rendering the user interface, handling user interactions, and communicating with the backend server via REST API calls.

Server (Node.js/Express Backend):

index.js — Main server entry point; sets up Express, middleware, and routes.
config/ — Configuration files (e.g., database connection, environment variables).
controllers/ — Logic for handling API requests (e.g., authentication, tasks, AI assistant).
middleware/auth.js — Middleware to protect routes and verify JWT authentication.
routes/ — Defines API endpoints for authentication, tasks, and the AI assistant.
How it works:
The backend receives API requests from the client, processes them (including authentication and business logic), interacts with the database, and returns responses.

Database (PostgreSQL):

Stores all persistent data, such as users, tasks, and analytics.
The backend connects to the database using configuration from the config/ folder.
How Everything Connects:

The client sends API requests (like login, fetch tasks, chat with AI) to the server.
The server authenticates users, processes requests, interacts with the database, and (for AI chat) communicates with the Trinity AI API.
The database stores and retrieves all necessary data for the application.

## Project Structure

- `client/` — Vue 3 frontend
- `server/` — Node.js/Express backend
- `docker-compose.yml` — Multi-container orchestration
- `schema.sql` — Database schema

## Setup

1. Clone the repo
2. Install dependencies in both `client` and `server`
3. Configure `.env` files (see `.env.example`)
4. Start the backend:  
   `cd server && npm run dev`
5. Start the frontend:  
   `cd client && npm run dev`
6. Open the app at `http://localhost:5173`

## API

- `/api/auth` — Authentication routes
- `/api/tasks` — Task management
- `/api/assistant/chat` — AI assistant (requires JWT)


---

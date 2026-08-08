# Chat Application

## [Deploy Domain](https://client-production-b9fd.up.railway.app/)

A real-time chat application built with React, NestJS, and WebSockets.

## Features

- Real-time messaging using WebSockets (Socket.io)
- User authentication with JWT tokens
- Create and manage chat rooms
- User presence tracking
- Emoji support in messages
- Responsive design with TailwindCSS

## Tech Stack

### Frontend
- React 19
- Vite
- Socket.io-client
- React Router
- TailwindCSS
- Emoji Picker

### Backend
- NestJS
- TypeORM
- MySQL
- Socket.io
- JWT Authentication
- Argon2 for password hashing

## Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)
- Yarn package manager

## Environment Variables

Create a `.env` file in the root directory:

```env
# MySQL
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=chat_db
MYSQL_USER=chat_user
MYSQL_PASSWORD=your_password

# JWT
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=7d
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cookie
COOKIE_DOMAIN=localhost
```

## Quick Start with Docker

1. Clone the repository
2. Create `.env` file with the variables above
3. Start the application:

```bash
docker compose up --build
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api

## Local Development

### Backend Setup

```bash
cd server
yarn install
yarn start:dev
```

### Frontend Setup

```bash
cd client
yarn install
yarn dev
```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:8000.

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── utils/         # Utility functions
│   ├── Dockerfile
│   └── package.json
├── server/                # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── chat/          # Chat module
│   │   ├── message/       # Message module
│   │   └── common/        # Common utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Chat
- `GET /chat/rooms` - Get all chat rooms
- `POST /chat/create` - Create a new chat room
- `PUT /chat/rooms/:id` - Update chat room
- `DELETE /chat/rooms/:id` - Delete chat room

## WebSocket Events

### Chat Gateway (namespace: `/chat`)
- `join` - Join a chat room
- `leavingRoom` - Leave a chat room
- `joined` - Room joined successfully (server → client)
- `usersCountUpdated` - User count updated (server → client)

### Messages Gateway (namespace: `/messages`)
- `join` - Join messages room
- `addMessage` - Send a new message
- `newMessage` - Receive new message (server → client)
- `updateMessage` - Update a message
- `deleteMessage` - Delete a message

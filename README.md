# Admin Panel for Quest Rooms

## About the Project

Backend system for managing escape room experiences built with **Express.js**, **JavaScript**, **SQLite**, and **Sequelize** ORM.

### Key Features

1. **Admin Room Creation**: Admins create game rooms with specific games and locations
2. **Client Registration**: Clients join rooms by entering room number and providing personal info with digital signature
3. **Passport Generation**: System automatically generates printable client passports after game sessions
4. **Client Portal**: Clients access their account to view game history, time spent, and game statistics

### Technology Stack

Express.js, JavaScript (Node.js), SQLite, Sequelize, JWT, Multer, Joi

## Environment Variables

Create a file named `.env` in the **root** of your project (alongside `package.json` and `swagger.yaml`) with the following contents:

```ini
PORT=8000
JWT_SECRET_ADMIN=jwt_secret
PASSWORD_SALT=4
SUPERADMIN_DATA={ "firstName":"Super", "lastName":"Admin", "username":"superadmin", "password":"superadmin", "isSuperAdmin":true}
```

# Installation

1. Clone the repository:

```
git clone https://github.com/Leu3ery/AdminFormular.git
cd your-repo
```

2. Install dependencies:

```
npm install
```

# Startup

From the project root:

```
npm install
mkdir -p public
node src/server.js
```

The server will start on http://localhost:8000 by default (or the port specified in your `.env` file).

# API Documentation

All API endpoints are defined in `swagger.yaml`. Load it in Swagger UI or your preferred OpenAPI viewer.

The API provides endpoints for admin, location, game, room, and client management, including file uploads for game icons and client photos.

## Authentication

The API uses JWT for authentication. Include the token in the `Authorization` header as `Bearer <token>` for protected routes. A super admin account is automatically created on server startup.
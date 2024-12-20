
# Bridge Deployment Kit

This repository contains the necessary components for setting up a Dockerized environment that integrates a Node.js application with PostgreSQL and NocoDB. The goal is to create a seamless environment where users can easily manage their database and application logic.

## Overview

The Bridge Deployment Kit includes:

- **Node.js Application**: A backend application that interacts with PostgreSQL using Prisma.
- **PostgreSQL Database**: A relational database for storing application data.
- **NocoDB**: An open-source platform for managing and interacting with your database through a user-friendly interface.

## Setting Up the Environment

### 1. Docker Compose Configuration

Ensure your `docker-compose.yml` is configured correctly:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: yourusername
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: prisma_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

  app:
    build: .
    environment:
      DATABASE_URL: "postgresql://yourusername:yourpassword@postgres:5432/prisma_db"
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - .:/app
    command: npm run dev
    networks:
      - app-network

  nocodb:
    image: nocodb/nocodb:latest
    ports:
      - "8080:8080"
    environment:
      NC_DB: "pg://host.docker.internal:5432?u=yourusername&p=yourpassword&d=nocodb_db"
      NC_USER_EMAIL: "admin@example.com"
      NC_USER_PASSWORD: "adminpassword"
    depends_on:
      - postgres
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 2. Connecting NocoDB to PostgreSQL

Use the following JSON schema to connect NocoDB to your PostgreSQL database:

for remote ubuntu local

```json
{
  "title": "bridge",
  "dataSource": {
    "client": "pg",
    "connection": {
      "host": "postgres",
      "port": 5432,
      "user": "yourusername",
      "password": "yourpassword",
      "database": "prisma_db"
    },
    "searchPath": [
      "public"
    ]
  },
  "sslUse": "No",
  "extraParameters": [],
  "is_private": false
}
```

for local server
```json
{
  "title": "bridge",
  "dataSource": {
    "client": "pg",
    "connection": {
      "host": "host.docker.internal",
      "port": 5432,
      "user": "yourusername",
      "password": "yourpassword",
      "database": "prisma_db"
    },
    "searchPath": [
      "public"
    ]
  },
  "sslUse": "No",
  "extraParameters": [],
  "is_private": false
}
```

This configuration can be used in NocoDB to establish a connection with your PostgreSQL database. For detailed instructions, refer to the NocoDB documentation:

- [Create a Connection: NocoDB Integration Guide](https://docs.nocodb.com/setup-and-usage/connection-create)
- [Connect to Data Source: NocoDB Data Source Guide](https://docs.nocodb.com/setup-and-usage/data-source)

## Running the Project

1. Ensure Docker and Docker Compose are installed on your system.
2. Run `docker-compose up` to start all services.
3. Access your application at http://localhost:3000.
4. Access NocoDB at http://localhost:8080 to manage your database.

## Working with Environment Variables

This project uses environment variables to manage different configurations for development and production environments. Here's how you can set up and manage them:

### 1. Environment Files

- `.env.development`: This file contains variables for your development environment.
- `.env.production`: This file contains variables for your production environment.

Example content for `.env.development`:

```
DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/prisma_db?schema=public"
MAKE_BASE_URL=https://eu2.make.com
MAKE_API_VERSION=/api/v2
MAKE_API_KEY=xxxx
MAKE_ORG_ID=xxxx
MASTER_MAKE_TEAM=xxxxx
APP_MODE=development
APP_BASE_URL=http://localhost:3000
APPLICATION_URL=xxx.xxx.xxx.xxx
PORT=3000
DEBUG_COLORS=true
DEBUG=*
```
### 2. Start with pulling data from Make

userId - is any alphanumerical that may match your user ID, that will try to find users in app data base and if not exist going to create a New team in Make and in parallel will sync all info from Master team to app DBs

```
curl -X GET "http://APPLICATION_URL:3000/api/templates?userId=user-333" \
  -H "Content-Type: application/json"
```

### 3. Access Links

Access NocoDB: 
APPLICATION_URL:8080/

Templates page:
APPLICATION_URL:3000/templates

## Contributing

Feel free to submit issues or pull requests if you find any bugs or have suggestions for improvements.

## License

This project is licensed under the MIT License.

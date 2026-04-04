# Telecom Ticketing System

**COMP2201 – Technical Project | Group 1 | University of Doha for Science and Technology**

A web-based ticketing system built for a telecommunications company. The system allows field staff to submit fault and service request tickets, enables technicians to track and resolve those tickets through a structured five-stage lifecycle, and gives administrators a full operational dashboard with workload metrics and audit history.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker (Recommended)](#run-with-docker-recommended)
  - [Run Locally (Without Docker)](#run-locally-without-docker)
- [User Roles](#user-roles)
- [Ticket Lifecycle](#ticket-lifecycle)
- [API Endpoints](#api-endpoints)
- [Team Members](#team-members)
- [Supervisor](#supervisor)

---

## Project Overview

Telecom operations teams often manage equipment faults and service requests through phone calls and group messages, with no structured record of who is responsible or how long issues have been open. This project addresses that problem with a purpose-built ticketing platform that covers:

- Role-based access for Requesters, Staff, and Admins
- A five-stage ticket lifecycle with server-side enforcement
- Fixture tracking linking tickets to telecom assets (5G towers, fiber nodes, etc.)
- A complete audit log on every ticket
- A live metrics dashboard for staff and admins
- Full Docker containerization for easy deployment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, React Router, Axios |
| Backend | Python Flask, Flask-JWT-Extended, Flask-Bcrypt, SQLAlchemy |
| Database | MySQL |
| Deployment | Docker, Docker Compose, Nginx, Gunicorn |

---

## Features

- **Authentication** — JWT-based login and registration with bcrypt password hashing
- **Role-Based Access Control** — three roles with permissions enforced at both the API and frontend routing level
- **Ticket Management** — full CRUD operations with lifecycle transition enforcement
- **Fixture Tracking** — link tickets to telecom infrastructure assets (5G Tower, Fiber Node, Signal Booster, Router Hub, Base Station, Optical Line Terminal)
- **Audit Log** — every action on every ticket is logged with user ID, action description, and timestamp
- **Dashboard** — live metrics including open ticket count, average resolution time, status breakdown, priority distribution, and per-staff workload
- **Admin Panel** — manage user accounts and roles
- **Docker Deployment** — entire stack starts with a single command

---

## Project Structure

```
COMP2201-group1-telecom-ticketing-system/
│
├── ticketing-system-tele/
│   ├── backend/                  # Flask REST API
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── models.py         # SQLAlchemy models (Users, Tickets, Fixtures, AuditLogs)
│   │   │   ├── auth/             # Authentication routes (register, login, me)
│   │   │   ├── tickets/          # Ticket CRUD and lifecycle routes
│   │   │   ├── users/            # User management routes
│   │   │   ├── fixtures/         # Fixture tracking routes
│   │   │   ├── dashboard/        # Metrics endpoint
│   │   │   └── logs/             # Audit log routes
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── frontend/                 # React.js SPA
│   │   ├── src/
│   │   │   ├── context/          # AuthContext (JWT + user state)
│   │   │   ├── components/       # Navbar, ProtectedRoute
│   │   │   ├── pages/            # Login, Register, TicketList, TicketDetail,
│   │   │   │                     # NewTicket, Dashboard, AdminUsers, AuditLogs
│   │   │   └── api.js            # Axios instance with JWT interceptor
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── docker-compose.yml        # Orchestrates frontend, backend, and MySQL
│   └── .env.example              # Environment variable template
│
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine

That is all you need. Python, Node.js, and MySQL do not need to be installed separately.

---

### Run with Docker (Recommended)

**1. Clone the repository**

```bash
git clone https://github.com/Aysha60099830/COMP2201-group1-telecom-ticketing-system.git
cd COMP2201-group1-telecom-ticketing-system/ticketing-system-tele
```

**2. Create your environment file**

```bash
cp .env.example .env
```

Open `.env` and set your values:

```
MYSQL_ROOT_PASSWORD=yourpassword
MYSQL_DATABASE=ticketing_db
MYSQL_USER=ticketing_user
MYSQL_PASSWORD=yourpassword
JWT_SECRET_KEY=your-secret-key-here
```

**3. Start the application**

```bash
docker-compose up --build
```

**4. Access the application**

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:3000 |
| Backend API (Flask) | http://localhost:5000 |

**5. Stop the application**

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

---

### Run Locally (Without Docker)

#### Backend

```bash
cd ticketing-system-tele/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export JWT_SECRET_KEY=your-secret-key
export DATABASE_URL=mysql+pymysql://user:password@localhost/ticketing_db

# Run database migrations
flask db upgrade

# Start the Flask server
flask run
```

#### Frontend

```bash
cd ticketing-system-tele/frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will run on `http://localhost:3000` and proxy API calls to `http://localhost:5000`.

---

## User Roles

| Role | Permissions |
|---|---|
| **Requester** | Submit tickets, view their own tickets and ticket details |
| **Staff** | View all tickets, update ticket status, add notes, view audit logs |
| **Admin** | All staff permissions + manage users, assign tickets, view dashboard, delete tickets |

Default role for new registrations is **Requester**. Admins can change any user's role from the admin panel.

---

## Ticket Lifecycle

Tickets move through the following five stages. Status transitions are enforced server-side — a ticket cannot skip stages.

```
New → Assigned → In Progress → Resolved → Closed
```

| Status | Who Can Set It |
|---|---|
| New | Created automatically on ticket submission |
| Assigned | Admin (assigns to a staff member) |
| In Progress | Staff (when work begins) |
| Resolved | Staff (when the fault is fixed) |
| Closed | Admin (after final review) |

Every transition is automatically recorded in the audit log.

---

## API Endpoints

All endpoints except `/auth/register` and `/auth/login` require a valid JWT token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT token |
| GET | `/auth/me` | Any | Get current user profile |
| GET | `/tickets/` | Any | List tickets (role-filtered) |
| GET | `/tickets/<id>` | Any | Get single ticket |
| POST | `/tickets/` | Requester+ | Create a new ticket |
| PUT | `/tickets/<id>` | Staff+ | Update ticket or advance status |
| DELETE | `/tickets/<id>` | Admin | Delete a ticket |
| GET | `/tickets/<id>/logs` | Any | Get audit log for a ticket |
| GET | `/users/` | Staff+ | List all users |
| GET | `/users/staff` | Staff+ | List staff/admin users |
| PUT | `/users/<id>` | Admin | Update user role or details |
| DELETE | `/users/<id>` | Admin | Delete a user account |
| GET | `/fixtures/` | Any | List all fixtures |
| GET | `/fixtures/types` | Any | List supported fixture types |
| POST | `/fixtures/` | Staff+ | Register a new fixture |
| PUT | `/fixtures/<id>` | Staff+ | Update fixture details |
| DELETE | `/fixtures/<id>` | Admin | Delete a fixture |
| GET | `/dashboard/metrics` | Staff+ | Get dashboard metrics |
| GET | `/logs/` | Admin | Get recent system audit logs |

---

## Team Members

| Name | Student ID |
|---|---|
| Jehad Dergham | 60304159 |
| Abdulla Ahmed | 60100032 |
| Aysha Sultana | 60099830 |
| Lujain Issa *(Group Leader)* | 60104877 |
| Maha Almandhari | 60099557 |
| Menatalla Abdeltawab | 60105265 |
| Seif Mohamed  | 60103153 |

---

## Supervisor

**Dr. Ali Khalil**
College of Computing and Information Technology
University of Doha for Science and Technology

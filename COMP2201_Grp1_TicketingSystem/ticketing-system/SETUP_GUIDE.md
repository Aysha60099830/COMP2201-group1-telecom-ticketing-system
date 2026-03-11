# COMP2201 — Telecom Ticketing System
## Setup & Developer Guide
### Grp_1 | Supervisor: Dr. Ali Khalil

---

## Project Structure

```
ticketing-system/
├── backend/
│   ├── app.py              ← Flask entry point
│   ├── config.py           ← Environment config
│   ├── extensions.py       ← db, jwt, bcrypt
│   ├── models.py           ← All DB models (spec Section 3)
│   ├── requirements.txt    ← Python packages
│   ├── Dockerfile
│   └── routes/
│       ├── auth.py         ← Login, Register (spec Section 4)
│       ├── tickets.py      ← CRUD + lifecycle (spec Section 5)
│       ├── users.py        ← User management
│       ├── fixtures.py     ← Telecom fixtures
│       ├── dashboard.py    ← Metrics (spec Section 8)
│       └── logs.py         ← Audit trail (spec Section 6)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── context/AuthContext.js
│   │   ├── services/api.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   └── pages/
│   │       ├── Login.js
│   │       ├── Dashboard.js
│   │       ├── TicketList.js
│   │       ├── TicketDetail.js
│   │       └── NewTicket.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## Option A: Run with Docker (Recommended)

This is the easiest way to run everything at once.

**Prerequisites:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Open terminal in the project root (ticketing-system/)
cd ticketing-system

# 2. Build and start all containers
docker-compose up --build

# 3. Access the app:
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:5000/api
```

To stop:
```bash
docker-compose down
```

---

## Option B: Run Locally Without Docker

### Step 1: VS Code Setup

Install **Visual Studio Code**: https://code.visualstudio.com

Open the project folder in VS Code:
```bash
code ticketing-system/
```

Install these VS Code Extensions (Ctrl+Shift+X → search name):
- **Python** (by Microsoft)
- **Pylance** (by Microsoft)
- **ES7+ React/Redux/React-Native snippets** (by dsznajder)
- **Prettier - Code Formatter** (by Prettier)
- **MySQL** (by cweijan)
- **Thunder Client** (for API testing, alternative to Postman)
- **GitLens** (optional but useful)

---

### Step 2: MySQL Setup

1. Install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
2. Open MySQL Workbench or terminal and run:

```sql
CREATE DATABASE ticketing_db;
```

3. Update `backend/config.py` — replace the DATABASE_URL with your local MySQL credentials:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/ticketing_db'
```

---

### Step 3: Backend Setup

Open a new VS Code terminal (Ctrl+\`):

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask
python app.py
```

Flask will start on **http://localhost:5000**

The admin user is auto-created on first run:
- Email: `admin@telecom.qa`
- Password: `Admin@1234`

#### VS Code Debugger Setup for Flask:
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flask Debug",
      "type": "python",
      "request": "launch",
      "module": "flask",
      "env": {
        "FLASK_APP": "app.py",
        "FLASK_ENV": "development"
      },
      "args": ["run", "--host=0.0.0.0", "--port=5000"],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```
Then press **F5** to start debugging.

---

### Step 4: Frontend Setup

Open a **second** VS Code terminal:

```bash
cd frontend

# Install Node packages
npm install

# Install Tailwind CSS
npm install -D tailwindcss
npx tailwindcss init

# Start the React dev server
npm start
```

React will start on **http://localhost:3000**

---

## Ticket Lifecycle (Spec Section 5)

The system enforces this exact order:

```
New → Assigned → In Progress → Resolved → Closed
```

- **Requesters** submit tickets (start at "New")
- **Admins** assign tickets to staff (moves to "Assigned")
- **Staff** advance tickets through "In Progress" → "Resolved"
- **Admins** close resolved tickets

Every status change is recorded in the Audit Log (spec Section 6).

---

## API Endpoints Quick Reference

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | Any | Login |
| POST | /api/auth/register | Any | Register |
| GET | /api/tickets/ | All | List tickets |
| POST | /api/tickets/ | All | Create ticket |
| PUT | /api/tickets/:id | Staff/Admin | Update/advance |
| GET | /api/dashboard/metrics | Staff/Admin | Dashboard data |
| GET | /api/logs/ | Admin | All audit logs |

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@telecom.qa | Admin@1234 |

Create staff/requester accounts from the Users page (admin only) or the Register page.

---

## Team Members

| Name | Student ID |
|------|-----------|
| Abdulla Ahmed | 60100032 |
| Aysha Sultana | 60099830 |
| Jehad Dergham | 60304159 |
| Lujain Issa | 60104877 |
| Maha Almandhari | 60099557 |
| Menatalla Abdeltawab | 60105265 |
| Seif Mohamed | 60103153 |

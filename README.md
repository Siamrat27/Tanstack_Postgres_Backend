# 🚀 TanStack + Prisma + PostgreSQL Starter

A full-stack web app built with **TanStack Start**, **React**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**.  
It includes ready-to-use APIs for managing data — for example, `/api/graduates` and `/api/todos`.

---

## 🧩 Features

- ⚡ **React + TanStack Router** – File-based routing
- 🧱 **Prisma ORM + PostgreSQL** – Type-safe database layer
- 🎨 **Tailwind CSS** – Modern utility-first styling
- 🧠 **TanStack Query** – Simplified server data fetching
- 🧪 **Vitest** – Testing framework for React apps
- 🚀 **Vite** – Super-fast dev server and build tool

---

## 🧰 Prerequisites

Before cloning, make sure you have these installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) (comes with Node)
- [PostgreSQL](https://www.postgresql.org/)
- (Optional) [pgAdmin](https://www.pgadmin.org/) for GUI database management

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

```bash
2️⃣ Install Dependencies
bash
Copy code
npm install
3️⃣ Configure Environment Variables
Create a .env.local file in the root directory:

bash
Copy code
DATABASE_URL="postgresql://{username}:{password}@localhost:5432/{dbname}?schema={schemaname}"
🧠 Change the username, password, database, or schema name as needed.
Example: if your DB name is mydb, use postgresql://postgres:123456@localhost:5432/mydb?schema=public.
```

```bash
4️⃣ Prisma Setup
bash
Copy code
# Generate the Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push

# Optional: open Prisma Studio (visual database explorer)
npm run db:studio
```

```bash
5️⃣ Start the Development Server
bash
Copy code
npm run dev
Then open:
👉 Frontend → http://localhost:3000
👉 API → http://localhost:3000/api/graduates

🧠 API Endpoints
/api/graduates
Method	Endpoint	Description
GET	/api/graduates	Get all graduates
POST	/api/graduates	Create new graduate

/api/graduates/:student_id
Method	Endpoint	Description
GET	/api/graduates/:student_id	Get graduate by ID
PUT	/api/graduates/:student_id	Update graduate
DELETE	/api/graduates/:student_id	Delete graduate

🧱 Building for Production
bash
Copy code
npm run build
This will generate optimized production files in the dist/ folder.

🧪 Testing
This project uses Vitest for testing.

bash
Copy code
npm run test
```

🧪 Reset Postgres schema

```bash
npx prisma migrate reset --force
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

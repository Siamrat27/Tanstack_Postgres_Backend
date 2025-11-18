### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

2️⃣ Install Dependencies

```bash
npm install
```

3️⃣ Configure Environment Variables
Create a .env file in the root directory:

Copy from .env.example

4️⃣ Prisma Setup

```bash
# Generate the Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push

# Optional: open Prisma Studio (visual database explorer)
npm run db:studio
```

5️⃣ Start the Development Server

```bash
npm run dev
```

---

🧪 Reset Postgres schema

```bash
npx prisma migrate reset --force
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

---

🧪 Mock Data

```bash
-- 1. เริ่ม Transaction
BEGIN;

-- 2. ล้างข้อมูลเก่า (เรียงลำดับตาม Foreign Key) และ รีเซ็ต ID
TRUNCATE
  "Attend", "Group", "Schedule", "Diploma", "Graduate",
  "User", "Faculty", "Round"
RESTART IDENTITY CASCADE;

-- 3. สร้างคณะ (Faculty) (ตาม List ล่าสุด)
INSERT INTO "Faculty" ("faculty_code", "faculty_name") VALUES
('01', 'สถาบันภาษาไทยสิรินธร'), ('02', 'ศูนย์การศึกษาทั่วไป'),
('20', 'บัณฑิตวิทยาลัย'), ('21', 'คณะวิศวกรรมศาสตร์'),
('22', 'คณะอักษรศาสตร์'), ('23', 'คณะวิทยาศาสตร์'),
('24', 'คณะรัฐศาสตร์'), ('25', 'คณะสถาปัตยกรรมศาสตร์'),
('26', 'คณะพาณิชยศาสตร์และการบัญชี'), ('27', 'คณะครุศาสตร์'),
('28', 'คณะนิเทศศาสตร์'), ('29', 'คณะเศรษฐศาสตร์'),
('30', 'คณะแพทยศาสตร์'), ('31', 'คณะสัตวแพทยศาสตร์'),
('32', 'คณะทันตแพทยศาสตร์'), ('33', 'คณะเภสัชศาสตร์'),
('34', 'คณะนิติศาสตร์'), ('35', 'คณะศิลปกรรมศาสตร์'),
('36', 'คณะพยาบาลศาสตร์'), ('37', 'คณะสหเวชศาสตร์'),
('38', 'คณะจิตวิทยา'), ('39', 'คณะวิทยาศาสตร์การกีฬา'),
('40', 'สำนักวิชาทรัพยากรการเกษตร'), ('51', 'วิทยาลัยประชากรศาสตร์'),
('53', 'วิทยาลัยวิทยาศาสตร์สาธารณสุข'), ('55', 'สถาบันภาษา'),
('56', 'สถาบันนวัตกรรมบูรณาการ'),
('58', 'สถาบันบัณฑิตบริหารธุรกิจ ศศินทร์ฯ'), ('99', 'มหาวิทยาลัยอื่น');

-- 4. สร้างรอบ (Round)
INSERT INTO "Round" ("round_code", "time", "round_type") VALUES
(1, '2025-10-10 09:00:00', 'rehearsal1'),
(2, '2025-10-11 09:00:00', 'rehearsal2'),
(3, '2025-10-12 10:00:00', 'ceremony');

-- 5. สร้างผู้ใช้งาน (User)
-- (ใช้ Bcrypt hash จริงของ 'password123' เพื่อให้ API 'login.ts' ทำงานได้)
INSERT INTO "User" (
  "username", "first_name", "last_name", "role", "faculty_code",
  "password_hash", "password_salt",
  "can_manage_undergrad_level", "can_manage_graduate_level"
) VALUES
('admin01', 'แอดมิน', 'ระบบ', 'Supervisor', NULL,
 '$2b$10$fA.E.q.T.G.F.W.z.D.g.O.r.S.g.i.m.N.c.o.D.C.N.P.o.E.i.O.W', NULL,
 false, false),

('staff_21', 'สมชาย', 'วิศวะ', 'Supervisor', 'NULL',
 '$2b$10$fA.E.q.T.G.F.W.z.D.g.O.r.S.g.i.m.N.c.o.D.C.N.P.o.E.i.O.W', NULL,
 true, true),

('staff_22', 'สมหญิง', 'อักษร', 'Professor', '22',
 '$2b$10$fA.E.q.T.G.F.W.z.D.g.O.r.S.g.i.m.N.c.o.D.C.N.P.o.E.i.O.W', NULL,
 true, false);

-- 6. สร้างบัณฑิต (Graduate) 30 คน
INSERT INTO "Graduate" (
  "student_id", "prefix_th", "first_name_th", "last_name_th",
  "prefix_en", "first_name_en", "last_name_en",
  "citizen_id", "ccr_barcode"
)
SELECT
  '6601' || lpad(i::text, 4, '0'),
  'นาย', 'บัณฑิตที่', i::text,
  'Mr.', 'Graduate', 'Number' || i::text,
  '1100000000' || lpad(i::text, 2, '0'),
  'CCR' || lpad(i::text, 5, '0')
FROM generate_series(1, 30) AS i;

-- 7. สร้างปริญญา (Diploma) 30 ใบ (เชื่อมโยงกับ Graduate)
-- (เนื่องจากเรารีเซ็ต ID แล้ว 'graduate_id' ที่ i จะตรงกับ Graduate ที่ i)
INSERT INTO "Diploma" (
  "degree_th", "major_th", "major_en",
  "faculty_code", "honor", "order_no", "order_display",
  "graduate_id", "student_id"
)
SELECT
  'บัณฑิต',
  CASE (i % 4)
    WHEN 0 THEN 'วิศวกรรมคอมพิวเตอร์'
    WHEN 1 THEN 'อักษรศาสตร์'
    WHEN 2 THEN 'วิทยาศาสตร์'
    ELSE 'รัฐศาสตร์'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Computer Engineering'
    WHEN 1 THEN 'Arts'
    WHEN 2 THEN 'Science'
    ELSE 'Political Science'
  END,
  CASE (i % 4)
    WHEN 0 THEN '21' -- วิศวะ (สำหรับ วิศวะคอม)
    WHEN 1 THEN '22' -- อักษร
    WHEN 2 THEN '23' -- วิทยา
    ELSE '24'        -- รัฐศาสตร์
  END,
  CASE (i % 5) WHEN 0 THEN 'อันดับ 1' ELSE NULL END,
  i, 'แถว A ที่ ' || i,
  i, '6601' || lpad(i::text, 4, '0')
FROM generate_series(1, 30) AS i;

-- 8. สร้างตารางเรียน (Schedule)
-- (เชื่อมกับ Round ID 1, 2, 3)
INSERT INTO "Schedule" ("date", "round_id") VALUES
('2025-10-10 09:00:00', 1),
('2025-10-11 09:00:00', 2),
('2025-10-12 10:00:00', 3);

-- 9. สร้างกลุ่ม (Group) บัณฑิต
-- (เชื่อมกับ Faculty ID ที่เราเพิ่งสร้าง)
INSERT INTO "Group" ("faculty_code", "order_start", "order_end") VALUES
('21', 1, 10),  -- กลุ่ม 1 (วิศวะ)
('22', 11, 20), -- กลุ่ม 2 (อักษร)
('23', 21, 30); -- กลุ่ม 3 (วิทย์+รัฐศาสตร์)

-- 10. สร้างการเข้าร่วม (Attend)
-- (เชื่อม Group ID 1,2,3 กับ Schedule ID 1,2,3)
INSERT INTO "Attend" ("group_id", "schedule_id")
SELECT g.id, s.id
FROM "Group" AS g, "Schedule" AS s;

-- 11. สิ้นสุด Transaction
COMMIT;
```

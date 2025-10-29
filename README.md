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
-- 1. เริ่ม Transaction เพื่อให้รันทั้งหมดหรือล้มเหลวทั้งหมด
BEGIN;

-- 2. (ข้อควรระวัง!) ล้างข้อมูลเก่าในตารางทั้งหมด และรีเซ็ต ID ที่นับอัตโนมัติ
-- เพื่อให้ ID เริ่มต้นที่ 1 และป้องกัน Foreign Key conflicts
TRUNCATE
  "Faculty", "Round", "User", "Graduate", "Diploma",
  "Schedule", "Group", "Attend"
RESTART IDENTITY CASCADE;

-- 3. สร้างข้อมูล "ราก" (Root Data) ที่ไม่มี Dependencies
-- สร้างคณะ (Faculty)
INSERT INTO "Faculty" ("faculty_code", "faculty_name") VALUES
('21', 'คณะวิศวกรรมศาสตร์'),
('22', 'คณะอักษรศาสตร์'),
('23', 'คณะวิทยาศาสตร์'),
('21104', 'สาขาวิศวกรรมคอมพิวเตอร์'); -- คณะ/สาขา ตามตัวอย่าง

-- สร้างรอบ (Round)
INSERT INTO "Round" ("round_code", "time", "round_type") VALUES
(1, '2025-10-10 09:00:00', 'rehearsal1'),
(2, '2025-10-11 09:00:00', 'rehearsal2'),
(3, '2025-10-12 10:00:00', 'ceremony');

-- 4. สร้างผู้ใช้งาน (User)
-- (หมายเหตุ: password_hash และ salt เป็นค่าสมมติ)
INSERT INTO "User" ("username", "first_name", "last_name", "role", "faculty_code", "password_hash", "password_salt") VALUES
('admin01', 'แอดมิน', 'ระบบ', 'Supervisor', NULL, 'dummy_hash_admin', 'dummy_salt_admin'),
('staff_21', 'สมชาย', 'วิศวะ', 'Staff', '21', 'dummy_hash_staff21', 'dummy_salt_staff21'),
('staff_22', 'สมหญิง', 'อักษร', 'Staff', '22', 'dummy_hash_staff22', 'dummy_salt_staff22'),
('prof_21104', 'อาจารย์', 'คอม', 'Professor', '21104', 'dummy_hash_prof', 'dummy_salt_prof');

-- 5. สร้างข้อมูลหลัก: บัณฑิต (Graduate) 30 คน
-- เราจะใช้ generate_series เพื่อสร้างข้อมูล 30 แถว
INSERT INTO "Graduate" (
  "student_id", "prefix_th", "first_name_th", "last_name_th",
  "prefix_en", "first_name_en", "last_name_en",
  "citizen_id", "ccr_barcode"
)
SELECT
  '6601' || lpad(i::text, 4, '0'), -- 66010001, 66010002, ...
  'นาย',
  'บัณฑิตที่',
  i::text,
  'Mr.',
  'Graduate',
  'Number' || i::text,
  '1100000000' || lpad(i::text, 2, '0'), -- Citizen ID ไม่ซ้ำ
  'CCR' || lpad(i::text, 5, '0') -- ccr_barcode ไม่ซ้ำ
FROM generate_series(1, 30) AS i;

-- 6. สร้างข้อมูลหลัก: ปริญญา (Diploma) 30 ใบ
-- (เชื่อมโยงกับ Graduate ทั้ง 30 คน)
INSERT INTO "Diploma" (
  "degree_th", "degree_en", "major_th", "major_en",
  "faculty_code", "honor", "order_no", "order_display",
  "graduate_id", "student_id"
)
SELECT
  'วิศวกรรมศาสตรบัณฑิต',
  'B.Eng.',
  -- สุ่มสาขา โดยขึ้นอยู่กับคณะ
  CASE (i % 4)
    WHEN 0 THEN 'วิศวกรรมคอมพิวเตอร์'
    WHEN 1 THEN 'วิศวกรรมโยธา'
    WHEN 2 THEN 'อักษรศาสตร์'
    ELSE 'วิทยาศาสตร์'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Computer Engineering'
    WHEN 1 THEN 'Civil Engineering'
    WHEN 2 THEN 'Arts'
    ELSE 'Science'
  END,
  -- สุ่มคณะ (ให้ตรงกับตัวอย่าง '21104' ด้วย)
  CASE (i % 4)
    WHEN 0 THEN '21104' -- วิศวะคอม
    WHEN 1 THEN '21'    -- วิศวะ (รวม)
    WHEN 2 THEN '22'    -- อักษร
    ELSE '23'           -- วิทยา
  END,
  -- สุ่มเกียรตินิยม
  CASE (i % 5)
    WHEN 0 THEN 'อันดับ 1'
    WHEN 1 THEN 'อันดับ 2'
    ELSE NULL
  END,
  i, -- order_no (ลำดับที่)
  'แถว A ที่ ' || i,
  i, -- graduate_id (เชื่อมกับ Graduate ID ที่ 1-30)
  '6601' || lpad(i::text, 4, '0') -- student_id (ตรงกับ Graduate)
FROM generate_series(1, 30) AS i;

-- 7. สร้างข้อมูลความสัมพันธ์ (ตาราง Scheduling)
-- สร้างตารางเรียน (Schedule) จาก Round (ID 1, 2, 3)
INSERT INTO "Schedule" ("date", "round_id") VALUES
('2025-10-10 09:00:00', 1), -- Rehearsal 1
('2025-10-11 09:00:00', 2), -- Rehearsal 2
('2025-10-12 10:00:00', 3); -- Ceremony

-- สร้างกลุ่ม (Group) บัณฑิต
-- สมมติแบ่งเป็น 3 กลุ่ม (กลุ่มละ 10 คน)
INSERT INTO "Group" ("faculty_code", "diploma_id", "order_start", "order_end") VALUES
('21104', 1, 1, 10), -- กลุ่ม 1 (วิศวะคอม): ลำดับ 1-10 (อ้างอิง diploma_id 1)
('22', 11, 11, 20),  -- กลุ่ม 2 (อักษร): ลำดับ 11-20 (อ้างอิง diploma_id 11)
('23', 21, 21, 30);  -- กลุ่ม 3 (วิทย์): ลำดับ 21-30 (อ้างอิง diploma_id 21)

-- สร้างการเข้าร่วม (Attend)
-- ให้ทุกกลุ่ม (ID 1, 2, 3) เข้าร่วมทุกรอบ (Schedule ID 1, 2, 3)
INSERT INTO "Attend" ("group_id", "schedule_id")
SELECT g.id, s.id
FROM "Group" AS g, "Schedule" AS s;

-- 8. สิ้นสุด Transaction และบันทึกข้อมูล
COMMIT;
```

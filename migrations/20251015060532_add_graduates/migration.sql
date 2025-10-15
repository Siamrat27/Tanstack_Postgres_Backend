-- CreateTable
CREATE TABLE "Graduate" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT,
    "prefix_th" TEXT,
    "first_name_th" TEXT,
    "last_name_th" TEXT,
    "prefix_en" TEXT,
    "first_name_en" TEXT,
    "last_name_en" TEXT,
    "barcode" TEXT,
    "gender" TEXT,
    "citizen_id" TEXT,
    "passport_no" TEXT,
    "ccr_barcode" TEXT,
    "do_survey" BOOLEAN DEFAULT false,
    "reading_first_name" TEXT,
    "reading_last_name" TEXT,

    CONSTRAINT "Graduate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_student_id_key" ON "Graduate"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_barcode_key" ON "Graduate"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_citizen_id_key" ON "Graduate"("citizen_id");

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_passport_no_key" ON "Graduate"("passport_no");

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_ccr_barcode_key" ON "Graduate"("ccr_barcode");

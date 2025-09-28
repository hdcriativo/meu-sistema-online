/*
  Warnings:

  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CostItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CostItem" DROP CONSTRAINT "CostItem_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CostItem" DROP CONSTRAINT "CostItem_materialId_fkey";

-- DropTable
DROP TABLE "public"."Budget";

-- DropTable
DROP TABLE "public"."CostItem";

-- DropTable
DROP TABLE "public"."Material";

-- DropTable
DROP TABLE "public"."Project";

-- CreateTable
CREATE TABLE "public"."ConcretePour" (
    "id" TEXT NOT NULL,
    "pourName" TEXT NOT NULL,
    "volumeM3" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pourDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendente',

    CONSTRAINT "ConcretePour_pkey" PRIMARY KEY ("id")
);

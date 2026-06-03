-- AlterTable
ALTER TABLE "Article" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "Article_editionId_language_category_idx" ON "Article"("editionId", "language", "category");

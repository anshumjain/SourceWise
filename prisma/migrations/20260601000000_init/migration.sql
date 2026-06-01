-- CreateTable
CREATE TABLE "Edition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "editionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "goodVotes" INTEGER NOT NULL DEFAULT 0,
    "badVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "editionDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Edition_date_key" ON "Edition"("date");

-- CreateIndex
CREATE INDEX "Article_editionId_category_idx" ON "Article"("editionId", "category");

-- CreateIndex
CREATE INDEX "Vote_articleId_idx" ON "Vote"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_articleId_voterId_editionDate_key" ON "Vote"("articleId", "voterId", "editionDate");

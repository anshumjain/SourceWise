-- CreateTable
CREATE TABLE "Edition" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Edition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "goodVotes" INTEGER NOT NULL DEFAULT 0,
    "badVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "voterIpHash" TEXT,
    "voteType" TEXT NOT NULL,
    "editionDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Edition_date_key" ON "Edition"("date");

-- CreateIndex
CREATE INDEX "Article_editionId_category_idx" ON "Article"("editionId", "category");

-- CreateIndex
CREATE INDEX "Vote_articleId_idx" ON "Vote"("articleId");

-- CreateIndex
CREATE INDEX "Vote_editionDate_voterIpHash_idx" ON "Vote"("editionDate", "voterIpHash");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_articleId_voterId_editionDate_key" ON "Vote"("articleId", "voterId", "editionDate");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

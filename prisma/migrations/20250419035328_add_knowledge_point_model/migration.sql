/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AnswerAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `ChatHistory` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "KnowledgePoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "embeddings" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "KnowledgePoint_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KnowledgePoint_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KnowledgePoint_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessingJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    CONSTRAINT "ProcessingJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessingStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "processingJobId" TEXT NOT NULL,
    "documentId" TEXT,
    "stepName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "message" TEXT,
    CONSTRAINT "ProcessingStep_processingJobId_fkey" FOREIGN KEY ("processingJobId") REFERENCES "ProcessingJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessingStep_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnswerAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    CONSTRAINT "AnswerAttempt_examAttemptId_fkey" FOREIGN KEY ("examAttemptId") REFERENCES "ExamAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnswerAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AnswerAttempt" ("examAttemptId", "id", "isCorrect", "questionId", "userAnswer") SELECT "examAttemptId", "id", "isCorrect", "questionId", "userAnswer" FROM "AnswerAttempt";
DROP TABLE "AnswerAttempt";
ALTER TABLE "new_AnswerAttempt" RENAME TO "AnswerAttempt";
CREATE TABLE "new_ChatHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isUser" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChatHistory" ("id", "isUser", "message", "userId") SELECT "id", "isUser", "message", "userId" FROM "ChatHistory";
DROP TABLE "ChatHistory";
ALTER TABLE "new_ChatHistory" RENAME TO "ChatHistory";
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "pageCount" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "extractedText" TEXT,
    "processingJobId" TEXT,
    CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_processingJobId_fkey" FOREIGN KEY ("processingJobId") REFERENCES "ProcessingJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("createdAt", "description", "fileName", "fileSize", "fileType", "fileUrl", "id", "pageCount", "processed", "processingStatus", "subCategoryId", "subjectId", "title", "updatedAt", "uploadedById") SELECT "createdAt", "description", "fileName", "fileSize", "fileType", "fileUrl", "id", "pageCount", "processed", "processingStatus", "subCategoryId", "subjectId", "title", "updatedAt", "uploadedById" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE TABLE "new_KnowledgeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "embeddings" TEXT,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "documentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "processingStepId" TEXT,
    CONSTRAINT "KnowledgeEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeEntry_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeEntry_processingStepId_fkey" FOREIGN KEY ("processingStepId") REFERENCES "ProcessingStep" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_KnowledgeEntry" ("authorId", "content", "createdAt", "documentId", "embeddings", "id", "importance", "subCategoryId", "subjectId", "tags", "title", "updatedAt", "viewCount") SELECT "authorId", "content", "createdAt", "documentId", "embeddings", "id", "importance", "subCategoryId", "subjectId", "tags", "title", "updatedAt", "viewCount" FROM "KnowledgeEntry";
DROP TABLE "KnowledgeEntry";
ALTER TABLE "new_KnowledgeEntry" RENAME TO "KnowledgeEntry";
CREATE UNIQUE INDEX "KnowledgeEntry_processingStepId_key" ON "KnowledgeEntry"("processingStepId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

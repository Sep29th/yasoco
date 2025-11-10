-- AlterTable
ALTER TABLE
    "User"
ADD
    COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "content" JSONB [],
    "contentText" TEXT,
    "searchVector" tsvector,
    "authorId" TEXT NOT NULL,
    "showInMainPage" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_isPublished_showInMainPage_idx" ON "Article"("isPublished", "showInMainPage");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "ArticleTag_articleId_idx" ON "ArticleTag"("articleId");

-- CreateIndex
CREATE INDEX "ArticleTag_tagId_idx" ON "ArticleTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleTag_articleId_tagId_key" ON "ArticleTag"("articleId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "ActionLog_createdAt_idx" ON "ActionLog"("createdAt");

-- CreateIndex
CREATE INDEX "Examination_parentPhone_idx" ON "Examination"("parentPhone");

-- CreateIndex
CREATE INDEX "Examination_date_idx" ON "Examination"("date");

-- CreateIndex
CREATE INDEX "ExaminationSession_daysOfWeek_idx" ON "ExaminationSession"("daysOfWeek");

-- CreateIndex
CREATE INDEX "Permission_createdAt_idx" ON "Permission"("createdAt");

-- CreateIndex
CREATE INDEX "PermissionRole_roleId_idx" ON "PermissionRole"("roleId");

-- CreateIndex
CREATE INDEX "PermissionRole_permissionId_idx" ON "PermissionRole"("permissionId");

-- CreateIndex
CREATE INDEX "Role_createdAt_idx" ON "Role"("createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- AddForeignKey
ALTER TABLE
    "UserRole"
ADD
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "UserRole"
ADD
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "PermissionRole"
ADD
    CONSTRAINT "PermissionRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "PermissionRole"
ADD
    CONSTRAINT "PermissionRole_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "ArticleTag"
ADD
    CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "ArticleTag"
ADD
    CONSTRAINT "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1) Thêm cột searchVector
ALTER TABLE
    "Article"
ADD
    COLUMN IF NOT EXISTS "searchVector" tsvector;

-- 2) Tạo function cập nhật searchVector dùng unaccent (bỏ dấu)
CREATE
OR REPLACE FUNCTION article_tsvector_update() RETURNS trigger AS $$ BEGIN -- Kết hợp title + contentText, bỏ dấu trước khi chuyển thành tsvector
NEW."searchVector" := to_tsvector(
    'simple',
    unaccent(coalesce(NEW.title, '')) || ' ' || unaccent(coalesce(NEW."contentText", ''))
);

RETURN NEW;

END $$ LANGUAGE plpgsql;

-- 3) Tạo trigger để tự động cập nhật trước INSERT/UPDATE
DROP TRIGGER IF EXISTS article_tsvector_update ON "Article";

CREATE TRIGGER article_tsvector_update BEFORE
INSERT
    OR
UPDATE
    ON "Article" FOR EACH ROW EXECUTE FUNCTION article_tsvector_update();

-- 4) Cập nhật các hàng cũ (một lần)
UPDATE
    "Article"
SET
    "searchVector" = to_tsvector(
        'simple',
        unaccent(coalesce(title, '')) || ' ' || unaccent(coalesce("contentText", ''))
    )
WHERE
    "searchVector" IS NULL;

-- 5) Tạo index GIN trên searchVector để FTS nhanh
CREATE INDEX IF NOT EXISTS article_search_vector_idx ON "Article" USING GIN ("searchVector");

-- 6) (Tùy chọn) Tạo index GIN trgm trên contentText để hỗ trợ similarity/ILIKE nhanh
CREATE INDEX IF NOT EXISTS article_contenttext_trgm_idx ON "Article" USING GIN ("contentText" gin_trgm_ops);
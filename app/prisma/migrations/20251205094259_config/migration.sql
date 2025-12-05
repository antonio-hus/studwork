-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL DEFAULT 'global_config',
    "name" TEXT NOT NULL DEFAULT 'Example University',
    "logo" TEXT NOT NULL,
    "themeColors" JSONB NOT NULL,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL,
    "smtpUser" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "emailFrom" TEXT NOT NULL,
    "allowPublicRegistration" BOOLEAN NOT NULL DEFAULT false,
    "studentEmailDomain" TEXT,
    "staffEmailDomain" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

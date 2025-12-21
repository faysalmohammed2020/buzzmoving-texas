-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AnalyticsEventName" AS ENUM ('session_start', 'page_view', 'heartbeat');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "password" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'oauth',
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" INTEGER,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "token_type" TEXT,
    "scope" TEXT,
    "session_state" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "lead_type" TEXT NOT NULL,
    "lead_source" TEXT NOT NULL,
    "referer" TEXT NOT NULL,
    "from_ip" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_ext" TEXT,
    "from_state" TEXT NOT NULL,
    "from_state_code" TEXT NOT NULL,
    "from_city" TEXT NOT NULL,
    "from_zip" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "to_state_code" TEXT NOT NULL,
    "to_city" TEXT NOT NULL,
    "to_zip" TEXT NOT NULL,
    "move_date" TIMESTAMP(3),
    "move_size" TEXT NOT NULL,
    "self_packaging" BOOLEAN,
    "has_car" BOOLEAN,
    "car_make" TEXT,
    "car_model" TEXT,
    "car_make_year" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiLead" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "callrail" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" SERIAL NOT NULL,
    "post_author" INTEGER,
    "tags" TEXT,
    "name" TEXT,
    "category" TEXT,
    "post_date" TIMESTAMP(3),
    "post_date_gmt" TIMESTAMP(3),
    "post_content" JSONB,
    "post_title" TEXT NOT NULL,
    "post_excerpt" TEXT,
    "post_status" TEXT,
    "comment_status" TEXT,
    "ping_status" TEXT,
    "post_password" TEXT,
    "post_name" TEXT,
    "to_ping" TEXT,
    "pinged" TEXT,
    "post_modified" TIMESTAMP(3),
    "post_modified_gmt" TIMESTAMP(3),
    "post_content_filtered" TEXT,
    "post_parent" INTEGER,
    "guid" TEXT,
    "menu_order" INTEGER,
    "post_type" TEXT,
    "post_mime_type" TEXT,
    "comment_count" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitCounter" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitLog" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" "AnalyticsEventName" NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "path" TEXT NOT NULL DEFAULT '/',
    "title" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screen" TEXT,
    "lang" TEXT,
    "country" TEXT,
    "city" TEXT,
    "active_seconds" INTEGER NOT NULL DEFAULT 0,
    "ip_hash" TEXT,
    "day_key" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_ip_cache" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "isp" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geo_ip_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_value_key" ON "verifications"("value");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_identifier_value_key" ON "verifications"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ApiLead_leadId_key" ON "ApiLead"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_post_name_key" ON "BlogPost"("post_name");

-- CreateIndex
CREATE INDEX "VisitCounter_dayKey_idx" ON "VisitCounter"("dayKey");

-- CreateIndex
CREATE UNIQUE INDEX "VisitCounter_slug_dayKey_key" ON "VisitCounter"("slug", "dayKey");

-- CreateIndex
CREATE INDEX "VisitLog_slug_dayKey_idx" ON "VisitLog"("slug", "dayKey");

-- CreateIndex
CREATE UNIQUE INDEX "VisitLog_slug_ip_dayKey_key" ON "VisitLog"("slug", "ip", "dayKey");

-- CreateIndex
CREATE INDEX "analytics_events_day_key_idx" ON "analytics_events"("day_key");

-- CreateIndex
CREATE INDEX "analytics_events_ip_hash_day_key_idx" ON "analytics_events"("ip_hash", "day_key");

-- CreateIndex
CREATE INDEX "analytics_events_ts_idx" ON "analytics_events"("ts");

-- CreateIndex
CREATE INDEX "analytics_events_event_ts_idx" ON "analytics_events"("event", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_visitor_id_ts_idx" ON "analytics_events"("visitor_id", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_ts_idx" ON "analytics_events"("session_id", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_path_ts_idx" ON "analytics_events"("path", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_utm_source_ts_idx" ON "analytics_events"("utm_source", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_device_type_ts_idx" ON "analytics_events"("device_type", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "geo_ip_cache_ip_key" ON "geo_ip_cache"("ip");

-- CreateIndex
CREATE INDEX "geo_ip_cache_updatedAt_idx" ON "geo_ip_cache"("updatedAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

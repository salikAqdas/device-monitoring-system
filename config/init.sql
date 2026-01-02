-- =====================================================
-- DEVICE MONITORING SYSTEM - DATABASE INITIALIZATION
-- =====================================================

-- =========================
-- ENUM TYPES
-- =========================
DO $$ BEGIN
    CREATE TYPE device_status_enum AS ENUM ('ONLINE', 'OFFLINE', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================
-- DEVICES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_name VARCHAR(100),
    location VARCHAR(150),
    ip_address INET NOT NULL,
    port INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- DEVICE STATUS (CURRENT STATE)
-- =========================
CREATE TABLE IF NOT EXISTS public.device_status (
    device_id VARCHAR(50) PRIMARY KEY,
    status device_status_enum NOT NULL DEFAULT 'UNKNOWN',
    last_checked_at TIMESTAMP,
    last_online_at TIMESTAMP,
    offline_since TIMESTAMP,
    failure_count INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    alert_sent boolean DEFAULT false,
    alert_sent_at timestamp without time zone,
    CONSTRAINT fk_device_status
        FOREIGN KEY (device_id)
        REFERENCES public.devices (device_id)
        ON DELETE CASCADE
);

-- =========================
-- DEVICE PING LOG (RAW TELEMETRY)
-- =========================
CREATE TABLE IF NOT EXISTS public.device_ping_log (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    ping_time TIMESTAMP NOT NULL,
    status device_status_enum NOT NULL,
    response_time_ms INTEGER,
    CONSTRAINT fk_device_ping
        FOREIGN KEY (device_id)
        REFERENCES public.devices (device_id)
        ON DELETE CASCADE
);

-- =========================
-- DEVICE STATUS HISTORY (STATE CHANGES)
-- =========================
CREATE TABLE IF NOT EXISTS public.device_status_history (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    status device_status_enum NOT NULL,
    checked_at TIMESTAMP NOT NULL,
    response_time_ms INTEGER,
    remarks TEXT,
    CONSTRAINT fk_status_history_device
        FOREIGN KEY (device_id)
        REFERENCES public.devices (device_id)
        ON DELETE CASCADE
);

-- =========================
-- INDEXES
-- =========================

-- Devices
CREATE INDEX IF NOT EXISTS idx_devices_active
    ON public.devices (is_active);

-- Status
CREATE INDEX IF NOT EXISTS idx_status_status
    ON public.device_status (status);

CREATE INDEX IF NOT EXISTS idx_status_checked
    ON public.device_status (last_checked_at);

-- Ping logs
CREATE INDEX IF NOT EXISTS idx_ping_time
    ON public.device_ping_log (ping_time);

CREATE INDEX IF NOT EXISTS idx_ping_device_time
    ON public.device_ping_log (device_id, ping_time);

-- History
CREATE INDEX IF NOT EXISTS idx_history_device_time
    ON public.device_status_history (device_id, checked_at);

-- =========================
-- UPDATED_AT AUTO-UPDATE TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_devices_updated ON public.devices;

CREATE TRIGGER trg_devices_updated
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable PostGIS for radius search
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE user_gender AS ENUM ('Male', 'Female', 'Other', 'Unspecified');
CREATE TYPE service_mode AS ENUM ('Physical', 'Digital');
CREATE TYPE exchange_preference AS ENUM ('DecideInChat', 'RequesterCollects', 'ProviderDropsOff');
CREATE TYPE job_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELETED');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    real_name TEXT NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    gender user_gender NOT NULL DEFAULT 'Unspecified',
    default_location GEOGRAPHY(POINT),
    default_radius_km INTEGER DEFAULT 5,
    is_anywhere_default BOOLEAN DEFAULT false,
    trust_score INTEGER DEFAULT 100,
    bio TEXT,
    skills TEXT[],
    profile_image_url TEXT,
    phone_number TEXT,
    phone_number_visible BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    is_incognito BOOLEAN DEFAULT false,
    is_women_only BOOLEAN DEFAULT false,
    service_mode service_mode NOT NULL DEFAULT 'Physical',
    location GEOGRAPHY(POINT),
    radius_km INTEGER,
    exchange_preference exchange_preference DEFAULT 'DecideInChat',
    budget_amount DECIMAL(10, 2),
    is_urgent BOOLEAN DEFAULT false,
    reference_images TEXT[] CHECK (array_length(reference_images, 1) <= 2),
    status job_status DEFAULT 'OPEN',
    requester_marked_paid BOOLEAN DEFAULT false,
    provider_marked_received BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Index for PostGIS queries
CREATE INDEX jobs_location_idx ON jobs USING GIST (location);
CREATE INDEX users_location_idx ON users USING GIST (default_location);

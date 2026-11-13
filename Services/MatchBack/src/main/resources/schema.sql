-- =====================================================================
-- Schema PostgreSQL - Base "worldcup2026"
-- =====================================================================
-- Fichier de reference pour le rapport.
-- En developpement, Hibernate cree ces tables automatiquement via
-- spring.jpa.hibernate.ddl-auto=update.
-- En production : passer en "validate" et executer ce script a la main.
-- =====================================================================

-- Creation de la base (a executer en tant que superuser) :
-- CREATE DATABASE worldcup2026;
-- \c worldcup2026;

-- ---------------------------------------------------------------------
-- Table : groupe
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS groupe (
    id   BIGSERIAL PRIMARY KEY,
    nom  VARCHAR(2) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- Table : equipe
-- L'id correspond a l'ID officiel d'API-Football (pas d'auto-increment).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipe (
    id              BIGINT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    code            VARCHAR(5),
    logo            VARCHAR(500),
    confederation   VARCHAR(20),
    classement_fifa INTEGER,
    groupe_id       BIGINT REFERENCES groupe(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_equipe_groupe ON equipe(groupe_id);
CREATE INDEX IF NOT EXISTS idx_equipe_confed ON equipe(confederation);

-- ---------------------------------------------------------------------
-- Table : classement
-- Position courante d'une equipe dans son groupe.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classement (
    id                   BIGSERIAL PRIMARY KEY,
    equipe_id            BIGINT NOT NULL UNIQUE REFERENCES equipe(id) ON DELETE CASCADE,
    position             INTEGER,
    matchs_joues         INTEGER DEFAULT 0,
    victoires            INTEGER DEFAULT 0,
    nuls                 INTEGER DEFAULT 0,
    defaites             INTEGER DEFAULT 0,
    buts_pour            INTEGER DEFAULT 0,
    buts_contre          INTEGER DEFAULT 0,
    difference           INTEGER DEFAULT 0,
    points               INTEGER DEFAULT 0,
    derniere_mise_a_jour TIMESTAMP
);

-- =====================================================================
-- Note : les matchs en direct et le cache API sont stockes dans MongoDB
-- (collections match_live et api_cache de la base worldcup2026_live).
-- =====================================================================

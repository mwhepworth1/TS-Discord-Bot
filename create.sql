-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS discord_bot_db;
USE discord_bot_db;

-- Drop and create the bot_settings table
DROP TABLE IF EXISTS bot_settings;
CREATE TABLE bot_settings (
    discord_id VARCHAR(50) NOT NULL PRIMARY KEY,
    color VARCHAR(50) NOT NULL,
    showlinks VARCHAR(5) NOT NULL,
    showgrades VARCHAR(5) NOT NULL,
    pastgrades INT NOT NULL,
    apikey VARCHAR(255) NOT NULL DEFAULT 'NONE',
    dnd VARCHAR(5) DEFAULT 'NO'
);

-- Drop and create the api table
DROP TABLE IF EXISTS api;
CREATE TABLE api (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_letter_grade VARCHAR(10),
    course_score DECIMAL(5,2),
    course_code VARCHAR(50),
    upcoming_assignments TEXT,
    past_assignments TEXT
);
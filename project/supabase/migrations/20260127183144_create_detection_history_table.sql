/*
  # Create detection history table

  1. New Tables
    - `detection_history`
      - `id` (uuid, primary key)
      - `objects_detected` (text array, detected objects)
      - `confidence_score` (numeric, 0-100)
      - `image_data` (bytea, captured image)
      - `created_at` (timestamptz)
      - `user_session_id` (text, browser session identifier)

  2. Security
    - Enable RLS on `detection_history` table
    - Add policy allowing users to read all historical detections in their session
    - Add policy allowing users to insert their own detections
    - Add policy allowing users to delete their own detections
*/

CREATE TABLE IF NOT EXISTS detection_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objects_detected text[] NOT NULL DEFAULT '{}',
  confidence_score numeric DEFAULT 0,
  image_data bytea,
  created_at timestamptz DEFAULT now(),
  user_session_id text NOT NULL,
  CONSTRAINT confidence_range CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

ALTER TABLE detection_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their session detections"
  ON detection_history FOR SELECT
  USING (user_session_id = current_setting('app.user_session_id', true));

CREATE POLICY "Users can create their own detections"
  ON detection_history FOR INSERT
  WITH CHECK (user_session_id = current_setting('app.user_session_id', true));

CREATE POLICY "Users can delete their own detections"
  ON detection_history FOR DELETE
  USING (user_session_id = current_setting('app.user_session_id', true));

CREATE INDEX idx_detection_history_session ON detection_history(user_session_id);
CREATE INDEX idx_detection_history_created ON detection_history(created_at DESC);

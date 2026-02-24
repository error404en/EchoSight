import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Detection {
  id: string;
  objects_detected: string[];
  confidence_score: number;
  created_at: string;
  image_data?: string;
}

export async function saveDetection(
  objects: string[],
  confidence: number,
  imageBlog?: Blob,
  sessionId?: string
) {
  const session = sessionId || getSessionId();

  let imageData = null;
  if (imageBlog) {
    const buffer = await imageBlog.arrayBuffer();
    imageData = buffer;
  }

  const { data, error } = await supabase
    .from('detection_history')
    .insert({
      objects_detected: objects,
      confidence_score: confidence,
      image_data: imageData,
      user_session_id: session,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving detection:', error);
    throw error;
  }

  return data;
}

export async function getDetectionHistory(sessionId?: string) {
  const session = sessionId || getSessionId();

  const { data, error } = await supabase
    .from('detection_history')
    .select('id, objects_detected, confidence_score, created_at')
    .eq('user_session_id', session)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching history:', error);
    throw error;
  }

  return data || [];
}

export async function deleteDetection(id: string) {
  const { error } = await supabase
    .from('detection_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting detection:', error);
    throw error;
  }
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem('vision-assistant-session');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('vision-assistant-session', sessionId);
  }
  return sessionId;
}

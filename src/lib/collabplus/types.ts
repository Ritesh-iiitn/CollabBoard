export type PresenceStatus = 'drawing' | 'typing' | 'viewing' | 'idle';

export type PresenceTool =
  | 'pen'
  | 'eraser'
  | 'text'
  | 'shape'
  | 'select'
  | 'hand';

export interface PresenceState {
  userId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  viewport: { x: number; y: number; zoom: number };
  activeTool: PresenceTool;
  status: PresenceStatus;
  lastSeen: number;
}

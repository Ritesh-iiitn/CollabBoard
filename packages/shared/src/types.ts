export type BoardRole = 'OWNER' | 'EDITOR' | 'VIEWER';

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

export interface BoardObjectStroke {
  type: 'stroke';
  id: string;
  points: number[];
  color: string;
  width: number;
  layerId?: string;
}

export interface BoardObjectShape {
  type: 'shape';
  id: string;
  shape: 'rect' | 'ellipse' | 'line' | 'arrow';
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  layerId?: string;
}

export interface BoardObjectText {
  type: 'text';
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  layerId?: string;
}

export interface BoardObjectImage {
  type: 'image';
  id: string;
  s3Key?: string;
  url?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  layerId?: string;
}

export type BoardObject =
  | BoardObjectStroke
  | BoardObjectShape
  | BoardObjectText
  | BoardObjectImage;

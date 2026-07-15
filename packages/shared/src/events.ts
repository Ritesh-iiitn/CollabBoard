/** CollabBoard++ domain event types (event sourcing) */
export enum BoardEventType {
  DRAW_LINE = 'DRAW_LINE',
  DELETE_STROKE = 'DELETE_STROKE',
  CLEAR_CANVAS = 'CLEAR_CANVAS',
  ADD_OBJECT = 'ADD_OBJECT',
  UPDATE_OBJECT = 'UPDATE_OBJECT',
  MOVE_SHAPE = 'MOVE_SHAPE',
  RESIZE_SHAPE = 'RESIZE_SHAPE',
  DELETE_OBJECT = 'DELETE_OBJECT',
  ADD_TEXT = 'ADD_TEXT',
  ADD_IMAGE = 'ADD_IMAGE',
  UNDO = 'UNDO',
  REDO = 'REDO',
}

export interface BoardEventEnvelope {
  eventId: string;
  boardId: string;
  sequence: number;
  type: BoardEventType | string;
  actorId: string;
  timestamp: string;
  payload: Record<string, unknown>;
  clientId: string;
  causationId?: string;
  version: 1;
}

export const SNAPSHOT_EVENT_INTERVAL = 50;
export const SNAPSHOT_TIME_MS = 10 * 60 * 1000;

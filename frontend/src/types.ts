export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string | null;
  is_archived: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  text: string;
  done: boolean;
}

export interface AISummaryResult {
  summary: string;
  bullets: string[];
}

export interface AIActionsResult {
  items: ActionItem[];
}

export interface AITitleResult {
  title: string;
}

export interface AIGenerateResponse {
  type: "summary" | "actions" | "title";
  provider: string;
  status: string;
  history_id: number;
  result: AISummaryResult | AIActionsResult | AITitleResult;
}

export interface AIHistoryEntry {
  id: number;
  note_id: number;
  type: string;
  provider: string;
  status: string;
  result: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

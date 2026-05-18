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
  is_public: boolean;
  share_token: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface PublicNote {
  title: string;
  content: string;
  category: string | null;
  tags: Tag[];
  updated_at: string;
}

export interface ShareLink {
  is_public: boolean;
  share_token: string | null;
  share_url: string | null;
}

export interface RecentlyEditedNote {
  id: number;
  title: string;
  updated_at: string;
}

export interface TagUsage {
  name: string;
  count: number;
}

export interface AIUsageStats {
  total_requests: number;
  by_type: Record<string, number>;
  last_7_days: number;
}

export interface WeeklyActivityDay {
  date: string;
  notes_updated: number;
  ai_requests: number;
}

export interface DashboardData {
  total_notes: number;
  archived_notes: number;
  recently_edited: RecentlyEditedNote[];
  top_tags: TagUsage[];
  ai_usage: AIUsageStats;
  weekly_activity: WeeklyActivityDay[];
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

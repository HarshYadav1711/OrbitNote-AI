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

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin: `/api` (default) or absolute backend URL, e.g. https://api.example.com */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_BASE_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

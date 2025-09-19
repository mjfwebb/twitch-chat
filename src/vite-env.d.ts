/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_BASE_URI: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly url: string;
}

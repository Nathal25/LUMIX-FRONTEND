/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_LOCAL_URL: string;
  readonly VITE_API_PROD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

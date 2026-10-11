/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  // NOTE: VITE_SEED_SECRET is intentionally included — it's a low-privilege
  // tool-only token used only to authenticate the admin seed UI action.
  // It does NOT grant AI API access; rotate independently of AI keys.
  readonly VITE_SEED_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

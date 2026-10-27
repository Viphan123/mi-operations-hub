declare global {
  interface CloudflareEnv {
    DB: D1Database;
    CF_ACCESS_TEAM_DOMAIN: string;
    CF_ACCESS_AUD: string;
    MI_EDITOR_EMAILS: string;
  }
}

export {};

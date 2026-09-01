// Allowed values for the string-encoded "enum" columns in prisma/schema.prisma.
// Kept as TS unions instead of native Prisma enums so the schema runs
// unmodified on both SQLite and Postgres.

export const TEAM_ROLES = ["OWNER", "MEMBER"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const SERVER_TRANSPORTS = ["STDIO", "HTTP"] as const;
export type ServerTransport = (typeof SERVER_TRANSPORTS)[number];

export const SERVER_STATUSES = ["UNKNOWN", "ONLINE", "OFFLINE", "ERROR"] as const;
export type ServerStatus = (typeof SERVER_STATUSES)[number];

export const SUBJECT_TYPES = ["USER", "TEAM"] as const;
export type SubjectType = (typeof SUBJECT_TYPES)[number];

export const RESOURCE_TYPES = ["SERVER", "TOOL"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const ACCESS_LEVELS = ["VIEW", "USE", "MANAGE"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const SYNC_STATUSES = ["RUNNING", "SUCCESS", "ERROR"] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const AUDIT_TARGET_TYPES = ["SERVER", "TEAM", "TEAM_MEMBER", "ACCESS_GRANT"] as const;
export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[number];

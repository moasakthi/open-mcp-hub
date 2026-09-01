import { z } from "zod";
import { ACCESS_LEVELS, RESOURCE_TYPES, SERVER_TRANSPORTS, SUBJECT_TYPES, TEAM_ROLES } from "@/lib/types";

const kvRecord = z.record(z.string(), z.string());

export const serverInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    description: z.string().trim().max(1000).optional(),
    transport: z.enum(SERVER_TRANSPORTS),
    command: z.string().trim().max(500).optional(),
    args: z.array(z.string()).optional(),
    env: kvRecord.optional(),
    url: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
    headers: kvRecord.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.transport === "STDIO" && !data.command) {
      ctx.addIssue({ code: "custom", path: ["command"], message: "Command is required for stdio servers" });
    }
    if (data.transport === "HTTP" && !data.url) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "URL is required for HTTP servers" });
    }
  });

export type ServerInput = z.infer<typeof serverInputSchema>;

export const teamInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

export const teamMemberInputSchema = z.object({
  email: z.string().trim().email("Must be a valid email"),
  role: z.enum(TEAM_ROLES),
});

export const accessGrantInputSchema = z.object({
  subjectType: z.enum(SUBJECT_TYPES),
  subjectId: z.string().min(1),
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().min(1),
  level: z.enum(ACCESS_LEVELS),
});

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const memberRoleEnum = pgEnum("member_role", ["ADMIN", "MEMBER"]);
export const taskStatusEnum = pgEnum("task_status", [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["Pro", "Normal"]);

export const workspaces = pgTable(
  "workspaces",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
    inviteCode: text("invite_code").notNull(),
    imageUrl: text("image_url"),
    imageId: text("image_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("workspaces_user_id_idx").on(table.userId),
  }),
);

export const members = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: memberRoleEnum("role").notNull().default("MEMBER"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workspaceUserUnique: uniqueIndex("members_workspace_user_uidx").on(
      table.workspaceId,
      table.userId,
    ),
    userIdIdx: index("members_user_id_idx").on(table.userId),
    workspaceIdIdx: index("members_workspace_id_idx").on(table.workspaceId),
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    imageUrl: text("image_url"),
    imageId: text("image_id"),
    docs: text("docs"),
    canvas: text("canvas"),
    isDocCreated: boolean("is_doc_created").default(false),
    docPermissionMemberList: jsonb("doc_permission_member_list").$type<
      string[] | null
    >(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workspaceIdIdx: index("projects_workspace_id_idx").on(table.workspaceId),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    status: taskStatusEnum("status").notNull(),
    assigneeId: text("assignee_id").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(1000),
    dueDate: timestamp("due_date", { withTimezone: true }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workspaceCreatedIdx: index("tasks_workspace_created_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
    projectCreatedIdx: index("tasks_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
    assigneeIdx: index("tasks_assignee_id_idx").on(table.assigneeId),
    statusIdx: index("tasks_status_idx").on(table.status),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: text("project_id"),
    taskId: text("task_id"),
    to: text("to"),
    message: text("message").notNull(),
    link: text("link"),
    seenBy: jsonb("seen_by").$type<string[]>().default([]),
    isMeetingNotification: boolean("is_meeting_notification")
      .default(false)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workspaceIdIdx: index("notifications_workspace_id_idx").on(
      table.workspaceId,
    ),
    toIdx: index("notifications_to_idx").on(table.to),
    projectIdIdx: index("notifications_project_id_idx").on(table.projectId),
    taskIdIdx: index("notifications_task_id_idx").on(table.taskId),
  }),
);

export const userPaymentStatus = pgTable(
  "user_payment_status",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("Normal"),
    stripePriceId: text("stripe_price_id"),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", {
      withTimezone: true,
    }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdUnique: uniqueIndex("user_payment_status_user_id_uidx").on(
      table.userId,
    ),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(members),
  projects: many(projects),
  tasks: many(tasks),
  notifications: many(notifications),
}));

export const membersRelations = relations(members, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [members.workspaceId],
    references: [workspaces.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));

export type WorkspaceRow = typeof workspaces.$inferSelect;
export type MemberRow = typeof members.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type TaskRow = typeof tasks.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type UserPaymentStatusRow = typeof userPaymentStatus.$inferSelect;

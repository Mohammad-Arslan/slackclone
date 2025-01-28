import { v } from "convex/values"; // Importing value validation functions
import { mutation, query } from "./_generated/server"; // Importing mutation and query functions for server interactions
import { auth } from "./auth"; // Importing authentication functions

const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code;
};

// The 'create' mutation allows users to create a new workspace
export const create = mutation({
  args: {
    name: v.string(), // The mutation expects a single argument 'name' which must be a string
  },

  // The handler function that processes the mutation
  handler: async (ctx, args) => {
    // Retrieve the user ID of the authenticated user
    const userId = await auth.getUserId(ctx);

    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();

    // Insert a new workspace into the database with the provided name, user ID, and join code
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });
    // Return the ID of the newly created workspace
    return workspaceId;
  },
});

// The 'get' query retrieves all workspaces from the database
export const get = query({
  args: {}, // No arguments are required for this query
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = [];

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);

      if (workspace) {
        workspaces.push(workspace);
      }
    }
    // Query t he database for all workspaces and collect the results
    return workspaces;
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("unauthorized");
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    if (!members) {
      return null;
    }

    return await ctx.db.get(args.id);
  },
  // handler: async (ctx, args) => {
  //   // New method using ctx.auth
  //   const identity = await ctx.auth.getUserIdentity();

  //   if (!identity) {
  //     throw new Error("Unauthorized");
  //   }
  //   // The user ID is available in identity.subject
  //   const userId = identity.subject;

  //   return await ctx.db.get(args.id);
  // },
});

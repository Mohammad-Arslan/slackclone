import { v } from "convex/values"; // Importing value validation functions
import { mutation, query } from "./_generated/server"; // Importing mutation and query functions for server interactions
import { auth } from "./auth"; // Importing authentication functions

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

    const joinCode = "12345"; // A static join code for the workspace

    // Insert a new workspace into the database with the provided name, user ID, and join code
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });
    // Return the ID of the newly created workspace
    return workspaceId;
  },
});

// The 'get' query retrieves all workspaces from the database
export const get = query({
  args: {}, // No arguments are required for this query
  handler: async (ctx) => {
    // Query the database for all workspaces and collect the results
    return await ctx.db.query("workspaces").collect();
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("unauthorized");
    }

    return await ctx.db.get(args.id);
  },
});

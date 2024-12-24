import {mutation} from "./_generated/server";
import {v} from "convex/values";

export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized")
        }

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: "/lamp.png"
        })

        return board;
    }
})

export const remove = mutation({
    args: {
        id: v.id("boards")
    },
    handler: async (ctx, args) => {
        const identity = ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        await ctx.db.delete(args.id)
    }
})

export const update = mutation({
    args: {
        id: v.id("boards"),
        title: v.string()
    },
    handler: async (ctx, args) => {

        const title = args.title.trim()
        const identity = ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized")
        }

        if (!title) {
            throw new Error("title is required")
        }

        const board = await ctx.db.patch(args.id, {
            title: args.title
        })

        return board
    }
})

export const favorite = mutation({
    args: {
        id: v.id("boards"),
        orgId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized")
        }

        const board = await ctx.db.get(args.id)

        if (!board) {
            throw new Error("Board not found")
        }

        const userId = identity.subject

        const existingFavorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_board_org", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
                    .eq("orgId", args.orgId)
            )
            .unique()

        if (existingFavorite) {
            throw new Error("Board already favorited")
        }

        await ctx.db.insert("userFavorites", {
            userId: userId,
            boardId: board._id,
            orgId: args.orgId
        })

        return board
    }
})

export const unFavorite = mutation({
    args: {
        id: v.id("boards"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized")
        }

        const board = await ctx.db.get(args.id)

        if (!board) {
            throw new Error("Board not found")
        }

        const userId = identity.subject

        const existingFavorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_board", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
            )
            .unique()

        if (!existingFavorite) {
            throw new Error("Favorited board not found")
        }

        await ctx.db.delete(existingFavorite._id)

        return board
    }
})
import { createProtectedRouter } from "../context";
import superjson from "superjson";
import { addItemSchema, getItemsSchema, markItemSchema, markItemsSchema, removeItemSchema, removeItemsSchema, updateItemSchema } from "../../common/validation/todoItem";
import { TRPCError } from "@trpc/server";
import { prisma } from "../../db/client";
import { TodoItem, User } from "@prisma/client";
import { env } from "../../../env/server.mjs";

export const todoRouter = createProtectedRouter()
  .transformer(superjson)
  .query('get-items-count', {
    resolve: async ({ ctx }) => {
      try {
        const todoItemsCount = await prisma.todoItem.count({
          where: {
            userId: ctx.session.user.id
          }
        });
        return todoItemsCount;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
    }
  })
  .query('get-items', {
    input: getItemsSchema,
    resolve: async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      try {
        const todoItems = await prisma.todoItem.findMany({
          where: {
            userId: userId
          },
          orderBy: [
            {
              marked: "asc",
            },
            // {
            //   createdAt: "desc"
            // }
          ],
          skip: input.page * env.NEXT_PUBLIC_CNTPERPAGE,
          take: env.NEXT_PUBLIC_CNTPERPAGE
        });
        return todoItems;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        })
      }
    },
  })
  .mutation('add-item', {
    input: addItemSchema,
    resolve: async ({ input, ctx }) => {
      let user: User | null | undefined;
      try {
        user = await prisma.user.findUnique({ where: { id: ctx.session.user.id }});
        if (!user) throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unregistered user"
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
      try {
        const createdTodoItem = await prisma.todoItem.create({
          data: {
            ...input,
            userId: user.id
          }
        });
        return createdTodoItem;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
    }
  })
  .mutation('update-item', {
    input: updateItemSchema,
    resolve: async ({ input, ctx }) => {
      let todoItem: TodoItem | null | undefined;
      try {
        todoItem = await prisma.todoItem.findUnique({
          where: { id: input.itemId }
        });
        if (!todoItem) throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Not found todoItem of ${input.itemId}`
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
      if (todoItem.userId === ctx.session.user.id) {
        try {
          const updatedItem = await prisma.todoItem.update({
            where: { id: input.itemId },
            data: {
              title: input.title,
              content: input.content,
            },
          });
          return updatedItem;
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message
          })
        }
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Permission error"
        });
      }
    },
  })
  .mutation('mark-item', {
    input: markItemSchema,
    resolve: async ({ input, ctx }) => {
      let todoItem: TodoItem | null | undefined;
      try {
        todoItem = await prisma.todoItem.findUnique({
          where: { id: input.itemId }
        });
        if (!todoItem) throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Not found todoItem of ${input.itemId}`
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
      if (todoItem.userId === ctx.session.user.id) {
        try {
          const updatedItem = await prisma.todoItem.update({
            where: { id: input.itemId },
            data: {
              marked: input.markStatus
            }
          });
          return updatedItem;
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message
          })
        }
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Permission error"
        });
      }
    }
  })
  .mutation('mark-items', {
    input: markItemsSchema,
    resolve: async ({ input, ctx }) => {
      let todoItems: TodoItem[] | null | undefined;
      try {
        todoItems = await prisma.todoItem.findMany({ where: { id: { in: input.itemIds }}});
        if (!todoItems.length) throw new TRPCError({
          code: "NOT_FOUND",
          message: `Not found todoItems of ${input.itemIds.length}`
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        })
      }
      const notOwned = todoItems.filter((todoItem) => todoItem.userId !== ctx.session.user.id).length > 0;
      
      if (!notOwned) {
        const updatedItems = await prisma.todoItem.updateMany({
          where: { id: { in: input.itemIds }},
          data: {
            marked: input.markStatus
          }
        });
        return updatedItems;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Permission error"
        })
      }
    }
  })
  .mutation('remove-item', {
    input: removeItemSchema,
    resolve: async ({ input, ctx }) => {
      let todoItem: TodoItem | null | undefined;
      try {
        todoItem = await prisma.todoItem.findUnique({
          where: { id: input.itemId }
        });
        if (!todoItem) throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Not found todoItem of ${input.itemId}`
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
      if (todoItem.userId === ctx.session.user.id) {
        try {
          const deletedItem = await prisma.todoItem.delete({
            where: { id: input.itemId },
          });
          return deletedItem;
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message
          })
        }
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Permission error"
        });
      }
    }
  })
  .mutation('remove-items', {
    input: removeItemsSchema,
    resolve: async ({ input, ctx }) => {
      let todoItems: TodoItem[] | null | undefined;
      try {
        todoItems = await prisma.todoItem.findMany({ where: { id: { in: input.itemIds }}});
        if (!todoItems.length) throw new TRPCError({
          code: "NOT_FOUND",
          message: `Not found todoItems of ${input.itemIds.length}`
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        })
      }
      const notOwned = todoItems.filter((todoItem) => todoItem.userId !== ctx.session.user.id).length > 0;
      if (!notOwned) {
        const removedItems = await prisma.todoItem.deleteMany({
          where: {
            id: {
              in: input.itemIds
            }
          }
        });
        return removedItems.count;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Permission error"
        })
      }
    }
  })
  .mutation('remove-complete-items', {
    resolve: async ({ ctx }) => {
      const userId = ctx.session.user.id;
      let completedItems: TodoItem[] | null | undefined;
      try {
        completedItems = await prisma.todoItem.findMany({
          where: {
            marked: true,
            userId: userId
          }
        });
        if (!completedItems || completedItems.length === 0) throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not found completed items"
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
      try {
        const deleted = await prisma.todoItem.deleteMany({
          where: {
            id: {
              in: completedItems.map(todoItem => todoItem.id)
            }
          }
        });
        return deleted.count;
      } catch (err: any) {
        throw new  TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }
    }
  });

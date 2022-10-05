// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { protectedExampleRouter } from "./protected-example-router";
import { signUpSchema } from "../common/validation/auth";
import { User } from "@prisma/client";
import { prisma } from "../db/client"
import { TRPCError } from "@trpc/server";
import { hash } from "argon2";
import { todoRouter } from "./todo";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", protectedExampleRouter)
  .merge("todo.", todoRouter)
  .mutation("sign-up", {
    input: signUpSchema,
    resolve: async ({ input }) => {
      const { name, email, password } = input;
      let existing: User | null | undefined;
      try {
        existing = await prisma.user.findUnique({
          where: { email }
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        })
      }

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      let hashPassword: string;
      try {
        hashPassword = await hash(password);
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message,
        });
      }

      let created: User | null | undefined;
      try {
        created = await prisma.user.create({
          data: { name, email, password: hashPassword }
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message
        });
      }

      return created;
    }
  });

// export type definition of API
export type AppRouter = typeof appRouter;

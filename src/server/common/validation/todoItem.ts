import * as z from "zod";

export const getItemsSchema = z.object({
  page: z.number().gte(0)
});

export const addItemSchema = z.object({
  title: z.string({
    required_error: "Title is required.",
    invalid_type_error: "Title should be string.",
  }).min(1, { message: "Title cannot be emptry." }),
  content: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title should be string",
  }).min(1, { message: "Content cannot be empty." }),
});

export const updateItemSchema = addItemSchema.extend({
  itemId: z.string(),
});

export const markItemSchema = z.object({
  itemId: z.string(),
  markStatus: z.boolean(),
});

export const markItemsSchema = z.object({
  itemIds: z.string().array().min(1),
  markStatus: z.boolean(),
});

export const removeItemSchema = z.object({
  itemId: z.string(),
});

export const removeItemsSchema = z.object({
  itemIds: z.string().array().min(1),
});

import { supabaseCollectionOptions } from "@supabase-labs/tanstack-db";
import { createCollection } from "@tanstack/react-db";
import { z } from "zod";
import { createClient } from "../lib/supabase";

const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof todoSchema>;

const supabase = createClient();

export const todoCollection = createCollection(
  supabaseCollectionOptions({
    tableName: "todos",
    schema: todoSchema,
    keys: ["id"],
    supabase,
    realtime: true,
  })
);

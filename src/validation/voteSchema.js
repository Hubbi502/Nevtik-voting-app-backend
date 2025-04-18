import { z } from "zod";

export const voteSchema = z.object({
  candidatesId: z.string("candidatesId isn't valid").nonempty("candidatesId isn't valid")
})
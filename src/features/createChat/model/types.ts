import { z } from "zod";

import { formSchema } from "./schema";

export type CreateChatFormValues = z.infer<typeof formSchema>;

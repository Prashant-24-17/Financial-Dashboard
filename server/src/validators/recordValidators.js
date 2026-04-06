const { z } = require("zod");

const createRecordSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(2, "Category must be at least 2 characters."),
  date: z.coerce.date(),
  notes: z.string().trim().max(500).optional().default(""),
});

const updateRecordSchema = z
  .object({
    amount: z.coerce.number().positive().optional(),
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().trim().min(2).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

const recordQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
};

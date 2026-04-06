const { z } = require("zod");

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("A valid email is required."),
  role: z.enum(["viewer", "analyst", "admin"]),
  status: z.enum(["active", "inactive"]).optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().email().optional(),
    role: z.enum(["viewer", "analyst", "admin"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

module.exports = {
  createUserSchema,
  updateUserSchema,
};

const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const FinancialRecord = require("../models/FinancialRecord");
const {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
} = require("../validators/recordValidators");

const router = express.Router();

router.get(
  "/",
  authorize("viewer", "analyst", "admin"),
  validate(recordQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const filters = {};

    if (type) {
      filters.type = type;
    }

    if (category) {
      filters.category = new RegExp(category, "i");
    }

    if (startDate || endDate) {
      filters.date = {};

      if (startDate) {
        filters.date.$gte = new Date(startDate);
      }

      if (endDate) {
        filters.date.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      FinancialRecord.find(filters)
        .populate("createdBy", "name email role")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FinancialRecord.countDocuments(filters),
    ]);

    res.json({
      data: records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  })
);

router.post(
  "/",
  authorize("admin"),
  validate(createRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await FinancialRecord.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await record.populate("createdBy", "name email role");
    res.status(201).json(populated);
  })
);

router.patch(
  "/:id",
  authorize("admin"),
  validate(updateRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await FinancialRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email role");

    if (!record) {
      return res.status(404).json({
        message: "Record not found.",
      });
    }

    res.json(record);
  })
);

router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const record = await FinancialRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Record not found.",
      });
    }

    res.status(204).send();
  })
);

module.exports = router;

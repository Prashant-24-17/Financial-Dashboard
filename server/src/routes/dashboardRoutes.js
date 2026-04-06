const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authorize = require("../middleware/authorize");
const FinancialRecord = require("../models/FinancialRecord");

const router = express.Router();

router.get(
  "/summary",
  authorize("viewer", "analyst", "admin"),
  asyncHandler(async (req, res) => {
    const [totals, categoryTotals, recentActivity, monthlyTrends] = await Promise.all([
      FinancialRecord.aggregate([
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      FinancialRecord.aggregate([
        {
          $group: {
            _id: {
              category: "$category",
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $sort: { total: -1 },
        },
      ]),
      FinancialRecord.find()
        .populate("createdBy", "name role")
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
      FinancialRecord.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
    ]);

    const totalIncome = totals.find((item) => item._id === "income")?.total || 0;
    const totalExpenses = totals.find((item) => item._id === "expense")?.total || 0;

    res.json({
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        netBalance: totalIncome - totalExpenses,
      },
      categoryTotals: categoryTotals.map((item) => ({
        category: item._id.category,
        type: item._id.type,
        total: item.total,
      })),
      recentActivity,
      monthlyTrends: monthlyTrends.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        type: item._id.type,
        total: item.total,
      })),
    });
  })
);

module.exports = router;

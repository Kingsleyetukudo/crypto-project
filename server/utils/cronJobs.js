import cron from "node-cron";
import Investment from "../models/Investment.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const initScheduledJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const activeInvestments = await Investment.find({ status: "active" });

      for (const investment of activeInvestments) {
        const dailyProfit =
          (investment.amount * (investment.roi / 100)) /
          investment.durationDays;

        if (Number.isFinite(dailyProfit) && dailyProfit > 0) {
          await User.findByIdAndUpdate(investment.userId, {
            $inc: { balance: dailyProfit },
          });

          await Transaction.create({
            userId: investment.userId,
            amount: dailyProfit,
            type: "profit",
            status: "completed",
            txHash: "",
          });
        }

        if (now >= new Date(investment.endDate)) {
          investment.status = "completed";
          await investment.save();
        }
      }
    } catch (error) {
      console.error("Daily investment profit cron failed:", error.message);
    }
  });
};

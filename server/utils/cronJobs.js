import cron from "node-cron";
import Investment from "../models/Investment.js";
import Transaction from "../models/Transaction.js";

export const initScheduledJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);
      const activeInvestments = await Investment.find({ status: "active" });

      for (const investment of activeInvestments) {
        const lastAccrualKey = investment.lastInterestAccrualAt
          ? new Date(investment.lastInterestAccrualAt).toISOString().slice(0, 10)
          : null;
        if (lastAccrualKey === todayKey) {
          if (now >= new Date(investment.endDate)) {
            investment.status = "completed";
            await investment.save();
          }
          continue;
        }

        const maxProfit = Number(investment.amount || 0) * (Number(investment.roi || 0) / 100);
        const dailyProfit =
          (investment.amount * (investment.roi / 100)) /
          investment.durationDays;

        if (Number.isFinite(dailyProfit) && dailyProfit > 0) {
          const accrued = Number(investment.totalInterestAccrued || 0);
          const remaining = Math.max(0, maxProfit - accrued);
          const interestToAdd = Math.min(dailyProfit, remaining);
          if (interestToAdd > 0) {
            investment.totalInterestAccrued = accrued + interestToAdd;
            investment.lastInterestAccrualAt = now;
            await investment.save();

            await Transaction.create({
              userId: investment.userId,
              amount: interestToAdd,
              type: "profit",
              status: "completed",
              source: "investment_roi",
              investmentId: investment._id,
              walletName: "Daily Investment Interest",
              txHash: "",
            });
          }
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

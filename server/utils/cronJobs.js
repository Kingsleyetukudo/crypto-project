import cron from "node-cron";
import Investment from "../models/Investment.js";
import Transaction from "../models/Transaction.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const accrueInvestmentInterest = async () => {
  const now = new Date();
  const activeInvestments = await Investment.find({ status: "active" });

  for (const investment of activeInvestments) {
    const endAt = new Date(investment.endDate);
    const amount = Number(investment.amount || 0);
    const roi = Number(investment.roi || 0);
    const duration = Number(investment.durationDays || 0);

    if (!amount || !roi || !duration || Number.isNaN(endAt.getTime())) {
      if (now >= endAt) {
        investment.status = "completed";
        await investment.save();
      }
      continue;
    }

    const maxProfit = round2(amount * (roi / 100));
    const dailyProfit = round2(maxProfit / duration);
    if (dailyProfit <= 0) {
      if (now >= endAt) {
        investment.status = "completed";
        await investment.save();
      }
      continue;
    }

    const accrued = Number(investment.totalInterestAccrued || 0);
    const remaining = Math.max(0, round2(maxProfit - accrued));
    const baseAt = new Date(investment.lastInterestAccrualAt || investment.createdAt || now);
    const firstPendingAccrualAt = new Date(baseAt.getTime() + DAY_MS);
    const cutoffAt = new Date(Math.min(now.getTime(), endAt.getTime()));

    if (remaining > 0 && cutoffAt >= firstPendingAccrualAt) {
      const elapsedMs = cutoffAt.getTime() - firstPendingAccrualAt.getTime();
      const eligibleDays = Math.floor(elapsedMs / DAY_MS) + 1;
      const maxDaysByRemaining = Math.floor((remaining + 0.000001) / dailyProfit);
      const accrualDays = Math.max(0, Math.min(eligibleDays, maxDaysByRemaining));

      if (accrualDays > 0) {
        const interestToAdd = Math.min(remaining, round2(accrualDays * dailyProfit));
        investment.totalInterestAccrued = round2(accrued + interestToAdd);
        investment.lastInterestAccrualAt = new Date(
          firstPendingAccrualAt.getTime() + (accrualDays - 1) * DAY_MS,
        );
        await investment.save();

        await Transaction.create({
          userId: investment.userId,
          amount: interestToAdd,
          type: "profit",
          status: "completed",
          source: "investment_roi",
          investmentId: investment._id,
          walletName:
            accrualDays > 1
              ? `Daily Investment Interest (${accrualDays} days)`
              : "Daily Investment Interest",
          txHash: "",
        });
      } else if (eligibleDays > 0 && remaining > 0) {
        investment.totalInterestAccrued = round2(accrued + remaining);
        investment.lastInterestAccrualAt = cutoffAt;
        await investment.save();

        await Transaction.create({
          userId: investment.userId,
          amount: remaining,
          type: "profit",
          status: "completed",
          source: "investment_roi",
          investmentId: investment._id,
          walletName: "Daily Investment Interest",
          txHash: "",
        });
      }
    }

    const latestAccrued = Number(investment.totalInterestAccrued || 0);
    if (now >= endAt || latestAccrued >= maxProfit - 0.000001) {
      investment.status = "completed";
      await investment.save();
    }
  }
};

export const initScheduledJobs = () => {
  cron.schedule("5 * * * *", async () => {
    try {
      await accrueInvestmentInterest();
    } catch (error) {
      console.error("Daily investment profit cron failed:", error.message);
    }
  });

  void accrueInvestmentInterest().catch((error) => {
    console.error("Initial investment profit accrual failed:", error.message);
  });
};

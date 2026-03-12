import cron from "node-cron";
import { expireCricketSubscriptions } from "../controllers/cricketGameController";
import { handleBetLossGGR } from "../controllers/GameLaunchController";

cron.schedule("0 0 * * *", expireCricketSubscriptions);



cron.schedule("* * * * *", async () => {
  try {
    await handleBetLossGGR();
    console.log("✅ Loss GGR cron ran successfully");
  } catch (err) {
    console.error("❌ Loss GGR cron error:", err);
  }
})

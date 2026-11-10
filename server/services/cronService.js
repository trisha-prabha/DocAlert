import cron from "node-cron";
import Item from "../models/Item.js";
import User from "../models/User.js";
import ReminderLog from "../models/ReminderLog.js";
import { calculateStatus, daysUntil } from "../utils/dateCalc.js";
import { sendReminderEmail } from "./notificationService.js";
import { format } from "date-fns";

/**
 * Daily Status Refresh Job
 * Recomputes and updates item statuses ('active', 'expiring_soon', 'expired') using MongoDB bulkWrite
 */
export const refreshItemStatuses = async () => {
  console.log("[Cron Job Started] Daily Item Status Refresh...");
  try {
    const items = await Item.find({}).select("_id expiryDate status");
    if (!items.length) {
      console.log("[Cron Job Complete] No items in database to refresh.");
      return;
    }

    const bulkOps = [];
    let updatedCount = 0;

    for (const item of items) {
      const currentCalculatedStatus = calculateStatus(item.expiryDate);
      if (item.status !== currentCalculatedStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { status: currentCalculatedStatus } },
          },
        });
        updatedCount++;
      }
    }

    if (bulkOps.length > 0) {
      await Item.bulkWrite(bulkOps);
      console.log(
        `[Cron Job Complete] Successfully refreshed status for ${updatedCount} items.`,
      );
    } else {
      console.log("[Cron Job Complete] All items are currently up-to-date.");
    }
  } catch (error) {
    console.error("[Cron Job Error - Status Refresh]:", error.message);
  }
};

/**
 * Daily Reminder Dispatch Job
 * Dispatches proactive email notifications via Resend for items matching reminder thresholds (e.g. 30, 15, 7, 1 days)
 */
export const dispatchDailyReminders = async () => {
  console.log("[Cron Job Started] Daily Expiration Reminder Dispatch...");
  try {
    // Find all items that are not permanently expired or have active reminders, populated with user info
    const items = await Item.find({
      status: { $in: ["active", "expiring_soon"] },
    }).populate("user");

    let remindersSent = 0;
    let remindersFailed = 0;
    const nowStr = format(new Date(), "yyyy-MM-dd HH:mm");

    for (const item of items) {
      if (!item.user || !item.user.email) continue;

      // Check user preferences
      if (item.user.notificationPreferences?.email === false) continue;

      const daysLeft = daysUntil(item.expiryDate);
      if (daysLeft < 0) continue; // Skip if already expired

      const thresholdList = item.reminderDays ||
        item.reminderPreferences?.daysBefore || [30, 15, 7, 1];

      // If today matches one of the scheduled reminder thresholds
      if (thresholdList.includes(daysLeft)) {
        // Idempotency check: verify whether a reminder for this item and daysLeft was already logged
        const existingLog = await ReminderLog.findOne({
          item: item._id,
          daysLeft,
        });

        if (!existingLog) {
          try {
            // Send reminder email first via Resend
            const emailResult = await sendReminderEmail(item, item.user);

            // ONLY create ReminderLog after email succeeds (enables automatic next-day retry if sending failed)
            await ReminderLog.create({
              item: item._id,
              daysLeft,
              channel: "email",
              recipientEmail: item.user.email,
              sentAt: new Date(),
            });

            // Record history in item
            if (!item.reminderHistory) item.reminderHistory = [];
            item.reminderHistory.push({
              date: nowStr,
              channel: "Email",
              message: `${daysLeft}-day proactive expiration notice dispatched (Resend ID: ${emailResult.id || "sent"}).`,
            });
            await item.save();

            remindersSent++;
            console.log(
              `[Reminder Sent] Item: "${item.productName}" -> ${item.user.email} (${daysLeft} days remaining)`,
            );
          } catch (sendErr) {
            remindersFailed++;
            console.error(
              `[Reminder Dispatch Error] Item ${item._id} ("${item.productName}"):`,
              sendErr.message,
            );
            // Continue loop to next item — one failed email must not block others
          }
        }
      }
    }

    console.log(
      `[Cron Job Complete] Summary: ${items.length} items checked, ${remindersSent} reminders sent successfully, ${remindersFailed} reminders failed.`,
    );
  } catch (error) {
    console.error("[Cron Job Error - Reminder Dispatch]:", error.message);
  }
};

/**
 * Initialize all automated cron schedules
 */
export const initCronJobs = () => {
  // 1. Midnight status refresh: 00:00 every day
  cron.schedule("0 0 * * *", () => {
    refreshItemStatuses();
  });

  // // 2. Morning reminder dispatch: 08:00 AM every day
  // cron.schedule("34 13 * * *", () => {
  //   // cron.schedule('0 8 * * *', () => {
  //   dispatchDailyReminders();
  // });

  cron.schedule(
    "* * * * *",
    () => {
      console.log("Testing reminder dispatch...");
      dispatchDailyReminders();
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  console.log(
    "[Cron Service] Scheduled jobs initialized (00:00 Status Refresh & 08:00 AM Reminder Dispatch).",
  );
};

export default { initCronJobs, refreshItemStatuses, dispatchDailyReminders };

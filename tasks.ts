import { birthdays, jobs } from "./db.ts";
import { sendTextMessage } from "./SMS.ts";

// SMS reminders for birthdays and other daily occurences
// Birthdays and jobs are pulled from an external database (MongoDB)
export async function runTasks(): Promise<void> {
  const now = new Date();

  const birthdaysArray = await birthdays.find({
    $and: [
      // Poll today's birthdays (month and day)
      { "$expr": { "$eq": [{ "$month": "$Date" }, now.getMonth() + 1] } },
      { "$expr": { "$eq": [{ "$dayOfMonth": "$Date" }, now.getDate()] } },
      // Send text at the requested hour
      { "$expr": { "$eq": ["$Hour", now.getHours()] } },
    ],
  }).toArray();
  for (const bday of birthdaysArray) {
    const message = `Today is ${bday.Holder}'s birthday!`;
    await sendTextMessage(message, bday.Recipient);
  }

  // Send text at the requested hour
  const jobsArray = await jobs.find({ "Hour": now.getHours() }).toArray();
  for (const job of jobsArray) {
    await sendTextMessage(job.Message, job.Recipient);
  }
}

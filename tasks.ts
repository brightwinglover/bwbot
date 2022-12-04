import { birthdays, jobs } from "./db.ts";
import { sendTextMessage } from "./SMS.ts";
import { json } from "https://deno.land/x/sift@0.6.0/mod.ts";

// SMS reminders for birthdays and other daily occurences
// Birthdays and jobs are pulled from an external database (MongoDB)
export async function runTasks(): Promise<void> {
  const now = new Date();
  console.log(now);
  console.log(await jobs.find({ "Hour": now.getHours() }).toArray());

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
    console.log(message);
    await sendTextMessage(message, bday.Recipient);
  }

  // Send text at the requested hour
  const jobsArray = await jobs.find({ "Hour": now.getHours() }).toArray();
  for (const job of jobsArray) {
    console.log(job.Message);
    await sendTextMessage(job.Message, job.Recipient);
  }
  console.log("Done with jobs.");
}

export async function tasks(request: Request) {
  // Enforce POST requests
  if (request.method !== "POST") {
    return json({ result: "Wrong request method. 🦕🚫" }, { status: 405 });
  }
  const data = await request.json();
  // Check if tasks key exists in environment variables
  const key = Deno.env.get("TASKS_KEY");
  if (!key) return json("No key loaded. 🗝️🦕", { status: 401 });
  // Validate input key
  if (data.key !== key) {
    return json({ result: "Wrong tasks key. 🦕🚫" }, { status: 401 });
  }
  // Case: success
  runTasks();
  return json("Running hourly tasks! 💪🦕");
}

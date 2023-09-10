// ? Initialize DB's jobs (texts) to send with baseline data

import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

interface JobSchema {
  _id: ObjectId;
  Name: string;
  Method: string;
  Recipient: string;
  Message: string;
  Weekday: number;
  Hour: number;
}

// Set up DB connection
const client: MongoClient = new MongoClient();
const uri = Deno.env.get("MONGODB_URI_SHA");
if (!uri) throw console.error("No connection string found.");
await client.connect(uri);
const jobs = client.database("Clussy").collection<JobSchema>("Jobs");

async function newJob(Message: string, Weekday: number, Hour: number) {
  const Recipient = Deno.env.get("TARGET_PHONE_NUMBER");
  if (!Recipient) {
    throw new Error("No TARGET_PHONE_NUMBER found in environment variables.");
  }
  return await jobs.insertOne({
    _id: new ObjectId(),
    Name: "Medicine",
    Method: "SMS",
    Recipient,
    Message,
    Weekday,
    // Time indexes from 0 for 12
    // Subtract an hour for daylight savings
    Hour: Hour + 1,
  });
}

await jobs.deleteMany({});

// ? Consider: Sophisticate to every half hour => 5:30 AM
// ? Note: Day 0 is Sunday, not Monday
// Insert Medicine texts @ 5:00 AM on weekdays
[1, 2, 3, 4, 5].forEach(async (weekday) =>
  await newJob("Take your medicine! 💊", weekday, 5)
);

// Insert Medicine texts @ 8:00 AM on weekends
[0, 6].forEach(async (weekday) =>
  await newJob("Take your medicine! 💊", weekday, 8)
);

// Insert Medicine & Tea Time texts @ 6:00 PM
[0, 1, 2, 3, 4, 5, 6].forEach(async (weekday) =>
  await newJob("Medicine and Tea Time! 💊", weekday, 18)
);

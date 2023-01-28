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
    Hour,
  });
}

await jobs.deleteMany({});

// ? Consider: Sophisticate to every half hour => 5:30 AM
// Insert Iron texts @ 5:00 AM
[0, 1, 3].forEach(async (weekday) =>
  await newJob("Take your iron! 💊", weekday, 5)
);
// Insert "All Medicine" test @ 5:00 AM
[2, 4].forEach(async (weekday) =>
  await newJob("Take all your medicine! 💊", weekday, 5)
);

// Insert Medicine texts @ 7:00 AM
[0, 1, 3].forEach(async (weekday) =>
  await newJob("Take your medicine! 💊", weekday, 7)
);

// Insert Medicine texts @ 8:00 AM on weekends
[5, 6].forEach(async (weekday) =>
  await newJob("Take your medicine! 💊", weekday, 8)
);

// Insert Medicine & Tea Time texts @ 6:00 PM
[0, 1, 2, 3, 4, 5, 6].forEach(async (weekday) =>
  await newJob("Medicine and Tea Time! 💊", weekday, 18)
);

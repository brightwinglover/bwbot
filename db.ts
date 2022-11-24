import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Models
interface BirthdaySchema {
  _id: ObjectId;
  Holder: string;
  Recipient: string;
  Date: Date;
  Hour: number;
}
interface JobSchema {
  _id: ObjectId;
  Name: string;
  Method: string;
  Recipient: string;
  Message: string;
  Hour: number;
}

const client: MongoClient = new MongoClient();
// Connection string - Stored as environment variable for security
const uri = Deno.env.get("MONGODB_URI_SHA");
if (!uri) throw console.error("No connection string found.");
await client.connect(uri);
export const birthdays = client.database("Clussy").collection<BirthdaySchema>(
  "Birthdays",
);
export const jobs = client.database("Clussy").collection<JobSchema>(
  "Jobs",
);

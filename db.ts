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

interface MileageSchema {
  // Native fields
  _id: ObjectId;
  Miles: number;
  Fuel: number;
  Date: Date;
  // Derived fields
  Economy: number;
  Temperature: number;
}

interface WeatherSchema {
  // Native fields
  _id: ObjectId;
  Temperature: number;
  Date: Date;
  // ? Consider: Weather conditions
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
export const mileages = client.database("Clussy").collection<MileageSchema>(
  "Mileages",
);
export const weather = client.database("Clussy").collection<WeatherSchema>(
  "Weather",
);

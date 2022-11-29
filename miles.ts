import { json, serveStatic } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { mileages, weather } from "./db.ts";

export async function miles(request: Request) {
  let mileagesArray = await mileages.find().sort({ Date: 1 }).toArray();
  switch (request.method) {
    case "GET":
      const file = await Deno.readFile("./templates/mileage.html");
      return new Response(new TextDecoder().decode(file), {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    case "POST":
      // Poll and compile data from db
      let data = await buildMileagesPayload();
      // Remove the baseline data point
      data.shift();
      return json({ data });
    default:
      // Invalid request method type
      return json({ error: "Bad request method." }, { status: 405 });
  }
}

async function buildMileagesPayload() {
  // Poll data and set initials
  const mileagesArray = await mileages.find().sort({ Date: 1 }).toArray();
  let last_miles = 0;
  let weatherArray = await weather.find().sort({ Date: 1 }).toArray();
  let last_date = new Date("2022-11-18");
  // ? For loop would be simpler but slower
  await Promise.all(mileagesArray.map((m) => {
    // Calculate fuel economy since last fill-up
    m.Economy = (m.Miles - last_miles) / m.Fuel || 0.;
    // 3 decimal places
    m.Economy = Number(m.Economy.toFixed(3));
    last_miles = m.Miles;
    // Calculate the average temperature since last fill-up
    const date_range = weatherArray.filter((d) =>
      d.Date > last_date && d.Date < m.Date
    );
    // Stop early if there's no data
    if (!date_range.length) {
      m.Temperature = 0;
      return;
    }
    const avgTemp = date_range.reduce(
      (sum, value) => sum + value.Temperature,
      0,
    ) / date_range.length;
    // console.log(`Dates between ${last_date} and ${m.Date}`);
    // console.log(date_range);
    // console.log("Average temp:");
    // console.log(avgTemp);
    m.Temperature = avgTemp;
    last_date = m.Date;
  }));
  // console.table(mileagesArray);
  return mileagesArray;
}

// ? Consider: Run at 4PM and exclude rainy days
async function addWeather() {
  // Poll current weather
  const weatherUrl = Deno.env.get("OPENWEATHER_URL")!;
  const res = await fetch(weatherUrl);
  const data = await res.json();
  // Kelvin to Fahrenheit
  let temp = (data.main.temp - 273.15) * 9 / 5 + 32;
  // 2 decimal places
  temp = Number(temp.toFixed(2));
  // Push to db
  await weather.insertOne({
    Temperature: temp,
    Date: new Date(),
  });
}

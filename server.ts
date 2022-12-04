import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { discord } from "./discord.ts";
import { tasks } from "./tasks.ts";
import { miles } from "./miles.ts";

// Routing
serve({
  // Base URL
  "/": () => new Response("Hello from Deno! 🎉🦕"),
  // Hourly chores - SMS reminders
  "/tasks": tasks,
  // Discord bot API
  "/discord": discord,
  // Mileage tracker & data visualization
  "/miles": miles,
  // Catch all
  404: () => new Response("Page not found. 🦕🔫", { status: 404 }),
});

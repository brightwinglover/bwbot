import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { discord } from "./discord.ts";
import { runTasks } from "./tasks.ts";

// Routing
serve({
  // Base URL
  "/": () => new Response("Hello from Deno! 🎉🦕"),
  // Hourly chores - SMS reminders
  "/tasks/": () => {
    runTasks();
    return new Response("Running hourly tasks! 💪🦕");
  },
  // Discord bot API
  "/discord/": discord,
  // Catch all
  404: () => new Response("Page not found. 🦕🔫", { status: 404 }),
});

import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { discord } from "./discord.ts";
import { runTasks } from "./tasks.ts";
import { miles } from "./miles.ts";

// Routing
serve({
  // Base URL
  "/": () => new Response("Hello from Deno! 🎉🦕"),
  // Hourly chores - SMS reminders
  "/tasks": () => {
    runTasks();
    return new Response("Running hourly tasks! 💪🦕");
  },
  // Discord bot API
  "/discord": discord,
  // Discord bot API
  "/miles": miles,
  "/favicon.ico": () =>
    new Response(
      "https://discord.com/channels/810957500987342908/947713427441352765/1046157681641128047",
    ),
  // Catch all
  404: () => new Response("Page not found. 🦕🔫", { status: 404 }),
});

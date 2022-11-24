import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { discord } from "./discord.ts";
import { runTasks } from "./tasks.ts";

// ? For testing; delete
const test = async (req: Request): Promise<Response> => {
  // console.log(await req.text());
  const t = await req.json();
  // const t = await req.text();
  let g = t?.key3;
  console.log(g);
  if (!g) g = 1;
  console.log(g);
  const { type = 0, data = { options: [] } } = JSON.parse(t);
  console.log(type);
  console.log(data);
  // console.log(t);
  // const t = `{"key1":"value1", "key2":"value2"}`;
  const x = JSON.stringify(t);
  // console.log(x);
  // console.log(JSON.parse(x));
  return new Response("Hello from Deno! 🎉🦕");
};

// Routing
serve({
  // Base URL
  "/": () => new Response("Hello from Deno! 🎉🦕"),
  // ? Testing: Can delete
  "/test": test,
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

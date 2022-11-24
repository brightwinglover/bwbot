import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";

export async function discord(request: Request) {
  const d = await request.json();
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  const valid = await verifySignature(request, d);
  if (error || !valid) {
    return json({ error: "Invalid request." }, { status: 401 });
  }
  // if (!valid) {
  //   return json({ error: "Invalid request" }, { status: 401 });
  // }
  const { type = 0, data = { options: [] } } = d;
  console.log("d", d);
  console.log("Type", type);
  console.log("Data", data);
  // Ping
  if (type === 1) return json({ type: 1 });

  // Slash commands
  if (type === 2) {
    // const { value } = data.options.find((option) => option.name === "name");
    // switch (data.data.name) {
    switch (data.name) {
      case "hello":
        return json({ type: 4, data: { content: "Hello!" } });
      case "cutie": {
        return json({ type: 4, data: { content: getCutie() } });
      }
    }
  }

  // Should be unreachable
  return json({ error: "Bad request." }, { status: 400 });
}

/** Verify whether the request is coming from Discord. */
function verifySignature(
  request: Request,
  data: JSON,
): boolean {
  const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
  // Discord sends these headers with every request.
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  // let intermediary = await request.json();
  // console.log("Intermediary:", intermediary);
  // const body = JSON.stringify(intermediary);
  // console.info("Initial body:", body);
  const body = data;
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + JSON.stringify(data)),
    // new TextEncoder().encode(timestamp + JSON.stringify(data)),
    hexToUint8Array(signature),
    hexToUint8Array(PUBLIC_KEY),
  );
  return valid;
}

/** Converts a hexadecimal string to Uint8Array. */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

function getCutie(): string {
  const url =
    "https://safebooru.org//images/4020/6b6a59a1b454b7571bc9a570becb37acd6c7758d.png?4200107";
  return url;
}

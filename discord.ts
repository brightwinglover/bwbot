import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";

export async function discord(request: Request) {
  // validateRequest() ensures that a request is of POST method and
  // has the following headers.
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  if (error) {
    return json({ error: "Invalid request." }, { status: 401 });
  }
  // const d = await request.json();
  // console.log("d", d);
  const { valid, body } = await verifySignature(request);
  console.log("valid", valid);
  if (!valid) {
    return json({ error: "Invalid request" }, { status: 401 });
  }
  const { type = 0, data = { options: [] } } = JSON.parse(body);
  console.log("Body", body);
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
async function verifySignature(
  request: Request,
  data = {},
): Promise<{ valid: boolean; body: string }> {
  const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
  // Discord sends these headers with every request.
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  let intermediary = await request.json();
  console.log("Intermediary:", intermediary);
  const body = intermediary.JSON.stringify(data);
  console.info("Initial body:", body);
  // const body = JSON.stringify(data);
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    // new TextEncoder().encode(timestamp + JSON.stringify(data)),
    hexToUint8Array(signature),
    hexToUint8Array(PUBLIC_KEY),
  );
  return { valid, body };
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

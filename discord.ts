import { json, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";
import { Buffer } from "https://deno.land/std@0.110.0/node/buffer.ts";
export async function discord(request: Request): Promise<Response> {
  // Only permit POST requests
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }
  const data = await request.json();
  console.log(data);

  // Discord requires valid signature & headers
  if (!assertRequestCompliant(request, data)) {
    return json({ error: "Invalid request." }, { status: 401 });
  }
  console.log(data.type);

  // Discord ping
  if (data.type === 1) return json({ type: 1 });

  // Slash commands
  if (data.type === 2) {
    switch (data.data.name) {
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

async function assertRequestCompliant(
  request: Request,
  body: Body,
): Promise<boolean> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  const valid = verifySignature(request, body);
  console.log(error, valid);
  if (error || !valid) return false;
  return true;
}

/** Verify whether the request is coming from Discord. */
function verifySignature(
  request: Request,
  body: Body,
): boolean {
  const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
  // Discord sends these headers with every request.
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  // const body = await request.text();
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + JSON.stringify(body)),
    hexToUint8Array(signature),
    hexToUint8Array(PUBLIC_KEY),
  );

  return valid;
}

/** Converts a hexadecimal string to Uint8Array. */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

// TODO: Generate cutie dynamically
function getCutie(): string {
  const url =
    "https://safebooru.org//images/4020/6b6a59a1b454b7571bc9a570becb37acd6c7758d.png?4200107";
  return url;
}

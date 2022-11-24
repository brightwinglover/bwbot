import { json, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";
import { Buffer } from "https://deno.land/std@0.110.0/node/buffer.ts";

export async function discord(request: Request) {
  // Grab data from request
  const body = await request.json();
  // Assert that the request matches Discord's requirements
  if (!await assertRequestCompliant(request, body)) {
    return json({ error: "Invalid request." }, { status: 401 });
  }
  // Grab data from request
  const { type = 0, data } = body;
  // Ping
  if (type === 1) return json({ type: 1 });

  // Slash commands
  if (type === 2) {
    // Determine which command by name
    switch (data.name) {
      case "hello":
        // Says hello in chat
        return json({ type: 4, data: { content: "Hello!" } });
        // Dispenses one cutie
      case "cutie": {
        return json({ type: 4, data: { content: getCutie() } });
      }
    }
  }

  // Should be unreachable
  return json({ error: "Bad request." }, { status: 400 });
}

function verifySignature(
  request: Request,
  data: JSON,
): boolean {
  const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + JSON.stringify(data)),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex"),
  );
  return valid;
}

async function assertRequestCompliant(
  request: Request,
  body: JSON,
): Promise<boolean> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  const valid = await verifySignature(request, body);
  if (error || !valid) return false;
  return true;
}

// TODO: Generate cutie dynamically
function getCutie(): string {
  const url =
    "https://safebooru.org//images/4020/6b6a59a1b454b7571bc9a570becb37acd6c7758d.png?4200107";
  return url;
}

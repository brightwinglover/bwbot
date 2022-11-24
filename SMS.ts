// Credentials - Stored as environment variable for security
const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
// ? CONSIDER: Deno.env.get("TWILIO_FROM_NUMBER")!;
if (!accountSid || !authToken) {
  throw new Error("No Twilio credentials found.");
}

// Build fetch
const url =
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
const encodedCredentials = btoa(`${accountSid}:${authToken}`);

export async function sendTextMessage(
  message: string,
  recipient: string,
): Promise<JSON> {
  // return new Promise(() => JSON.stringify({ "A": 1 }));
  // Build payload
  const body = new URLSearchParams({
    To: recipient,
    From: "+17622145785",
    Body: message,
  });
  // Post to Twilio
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${encodedCredentials}`,
    },
    body,
  });
  return await response.json();
}

let recipient = "", message = "";
const body1 = new URLSearchParams({
  To: recipient,
  From: "+17622145785",
  Body: message,
});

let To = "", Body = "", From = "";
const body2 = new URLSearchParams({ To, From, Body });

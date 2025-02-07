// localhost/api/dialin [POST]

import {
  defaultBotProfile,
  defaultConfig,
  defaultMaxDuration,
  defaultServices,
} from "./../../../rtvi.config";

export async function POST(request: Request) {
  const { test, callId, callDomain } = await request.json();

  console.log('Dialin request body:', {
    test,
    callId,
    callDomain,
    hasCallId: !!callId,
    hasCallDomain: !!callDomain,
  });

  if (!process.env.DAILY_BOTS_API_KEY) {
    console.error('DAILY_BOTS_API_KEY is not set in environment variables');
    return new Response('Server configuration error: Missing API key', {
      status: 500,
    });
  }

  //@TODO: HMAC header verification

  if (test) {
    // Webhook creation test response
    return new Response(JSON.stringify({ test: true }), { status: 200 });
  }

  if (!callId || !callDomain || !process.env.DAILY_BOTS_URL) {
    return new Response(`callId or callDomain not found on request body`, {
      status: 400,
    });
  }

  const payload = {
    bot_profile: defaultBotProfile,
    services: defaultServices,
    max_duration: defaultMaxDuration,
    api_keys: {
      together: process.env.TOGETHER_API_KEY,
      cartesia: process.env.CARTESIA_API_KEY,
    },
    config: defaultConfig,
    dialin_settings: {
      callId,
      callDomain,
    },
  };

  const req = await fetch(process.env.DAILY_BOTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_BOTS_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const res = await req.json();

  console.log('Daily Bots API response:', {
    status: req.status,
    statusText: req.statusText,
    headers: Object.fromEntries(req.headers.entries()),
    body: res
  });

  if (req.status !== 200) {
    return Response.json(res, { status: req.status });
  }

  return Response.json(res);
}

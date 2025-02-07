// localhost/api/dialout [POST]

import {
  defaultBotProfile,
  defaultConfig,
  defaultMaxDuration,
  defaultServices,
} from "./../../../rtvi.config";

export async function POST(request: Request) {
  const dialout_data = await request.json();

  console.log('Dialout request body:', {
    dialout_data,
    hasDialoutData: !!dialout_data,
  });

  if (!process.env.DAILY_BOTS_API_KEY) {
    console.error('DAILY_BOTS_API_KEY is not set in environment variables');
    return new Response('Server configuration error: Missing API key', {
      status: 500,
    });
  }

  if (!dialout_data || !process.env.DAILY_BOTS_URL) {
    return new Response(
      `dialout_data or phoneNumber not found on request body`,
      {
        status: 400,
      }
    );
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
    dialout_settings: dialout_data,
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

// [POST] /api
import {
  defaultBotProfile,
  defaultMaxDuration,
  defaultServices,
} from "../../../rtvi.config";

export async function POST(request: Request) {
  const { services, config, rtvi_client_version } = await request.json();

  console.log('Request body:', JSON.stringify({
    services,
    config,
    rtvi_client_version,
    hasServices: !!services,
    hasConfig: !!config,
  }, null, 2));

  if (!process.env.DAILY_BOTS_API_KEY) {
    console.error('DAILY_BOTS_API_KEY is not set in environment variables');
    return new Response('Server configuration error: Missing API key', {
      status: 500,
    });
  }

  if (!services || !config || !process.env.DAILY_BOTS_URL) {
    return new Response(`Services or config not found on request body`, {
      status: 400,
    });
  }

  const payload = {
    bot_profile: defaultBotProfile,
    max_duration: defaultMaxDuration,
    services: { ...defaultServices, ...services },
    api_keys: {
      openai: process.env.OPENAI_API_KEY,
      grok: process.env.GROK_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    },
    config: [...config],
    rtvi_client_version,
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

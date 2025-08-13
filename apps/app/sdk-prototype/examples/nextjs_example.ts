// Next.js API Route + Meterr
import { MeterrClient } from '@meterr/sdk';
import OpenAI from 'openai';

const meterr = new MeterrClient({ 
  apiKey: process.env.METERR_API_KEY 
});

const openai = meterr.trackCosts(new OpenAI(), {
  team: 'engineering',
  project: 'chatbot'
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Automatically tracked
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });
  
  const cost = meterr.getLastRequestCost();
  
  return Response.json({ 
    text: completion.choices[0].message.content,
    cost 
  });
}
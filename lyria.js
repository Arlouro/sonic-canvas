import { GoogleGenAI, LiveMusicServerMessage } from "@google/genai";
import Speaker from "speaker";
import { Buffer } from "buffer";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const client = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
    apiVersion: "v1alpha" ,
});

async function main() {
  console.log("Starting script...");
  console.log("API Key loaded:", !!process.env.GEMINI_API_KEY); // Should print 'true'
  
  const speaker = new Speaker({
    channels: 2,       // stereo
    bitDepth: 16,      // 16-bit PCM
    sampleRate: 48000, // 48 kHz
  });

  console.log("Speaker initialized. Attempting connection...");

  const session = await client.live.music.connect({
    model: "lyria-realtime-exp",
    callbacks: {
      onopen: () => console.log("Lyria RealTime stream opened."),
      onmessage: (message) => {
        if (message.serverContent?.audioChunks) {
          const chunk = message.serverContent.audioChunks[0];
          const audioBuffer = Buffer.from(chunk.data, "base64");
          speaker.write(audioBuffer);
        }
      },
      onerror: (error) => console.error("music session error:", error),
      onclose: (event) => { 
        console.log("Lyria RealTime stream closed.");
        if (event) console.log("Close Event:", event);
      }
    }
  });

  await session.setWeightedPrompts({
    weightedPrompts: [
    { text: "Psychedelic Rock with Saturated Tones, Moog Oscillations, Warm Acoustic Guitar, and Ethereal Ambience", weight: 1.0 }    ],
  });

  await session.play();

  console.log("Music generation started. Press Ctrl+C to stop.");
}

main().catch(console.error);


import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Vibe } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateRomanticMessage = async (vibe: Vibe, recipientName: string = "my love"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Write a short, heart-melting ${vibe.toLowerCase()} Valentine's message for someone named "${recipientName}". Keep it under 150 characters. Use one or two emojis.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.9,
      topP: 0.8,
    }
  });

  return response.text || "You are the beat in my heart. Happy Valentine's Day! ❤️";
};

export const generateLoveImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A highly detailed, beautiful romantic digital painting: ${prompt}. Cinematic lighting, soft warm colors, valentine aesthetic, 4k resolution.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed");
};

export const speakMessage = async (text: string, audioContext: AudioContext): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with a soft, loving, romantic tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const audioData = decodeBase64(base64Audio);
  const audioBuffer = await decodeAudioData(audioData, audioContext, 24000, 1);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};

// Helper for decoding PCM
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

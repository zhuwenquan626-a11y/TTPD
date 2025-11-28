
import { GoogleGenAI, Type } from "@google/genai";
import { SongAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_PREFIX = "ttpd_analysis_v7_pro_final_";

export const analyzeSongWithGemini = async (songTitle: string): Promise<SongAnalysis> => {
  // 1. Check Local Cache First
  const cacheKey = `${CACHE_PREFIX}${songTitle.replace(/\s+/g, '_').toLowerCase()}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    console.log(`Loading ${songTitle} from cache`);
    return JSON.parse(cachedData) as SongAnalysis;
  }

  const prompt = `
    You are a professional music critic and expert translator specializing in Taylor Swift's "The Tortured Poets Department" (TTPD).
    
    Task: Analyze "${songTitle}" for a Chinese audience.
    
    Requirements:
    1. **Background**: Deep insight in CHINESE. Explain the context, muse, and themes.
    2. **Translation**: FULL lyrics in CHINESE (Xin Da Ya style - Faithful, Expressive, Elegant). The original lyrics MUST be accurate to the official song.
    3. **Vocabulary**: 3 sophisticated English words from the lyrics with CHINESE definitions.
    4. **Connections**: 2 links to other TS songs in CHINESE.

    Output strict JSON.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      background: { type: Type.STRING },
      mood: { type: Type.STRING },
      lyrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            translation: { type: Type.STRING },
            annotation: { type: Type.STRING },
          },
          required: ["original", "translation"]
        }
      },
      vocabulary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING },
            contextInSong: { type: Type.STRING }
          },
          required: ["word", "definition", "contextInSong"]
        }
      },
      connections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            songTitle: { type: Type.STRING },
            album: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["songTitle", "album", "explanation"]
        }
      }
    },
    required: ["background", "mood", "lyrics", "vocabulary", "connections"]
  };

  try {
    console.log("Attempting analysis with Gemini 3 Pro...");
    // Force use of Pro model for best lyric quality
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText) as SongAnalysis;

    // Save to Cache
    localStorage.setItem(cacheKey, JSON.stringify(data));

    return data;

  } catch (error) {
    console.error("Gemini 3 Pro Failed:", error);
    
    // "Local Fail" - Graceful Fallback
    // Return this safe object so the app keeps working visually even if API fails.
    return {
        background: "由于 Gemini 3 Pro 模型目前负载过高，暂时无法生成该歌曲的深度解析。但这不会影响您的音频播放（如有本地文件）或歌词浏览。",
        mood: "Offline Mode",
        lyrics: [
            { original: "Analysis Unavailable", translation: "解析服务暂时繁忙", annotation: "请稍后重试" },
            { original: "Please try again later", translation: "请稍后再试", annotation: "" },
            { original: "Music plays on...", translation: "音乐继续...", annotation: "" }
        ],
        vocabulary: [],
        connections: [],
        error: "Quota Exceeded"
    };
  }
};

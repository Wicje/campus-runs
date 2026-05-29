import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Fallback parsing heuristics in case API key is missing or fails
function fallbackParse(text: string) {
  const normalized = text.toLowerCase();
  
  // High-frequency locations
  let source = "Campus Gate";
  if (normalized.includes("chitis")) source = "Chitis Fast Food";
  else if (normalized.includes("franco")) source = "Franco Stalls";
  else if (normalized.includes("jgi") || normalized.includes("print")) source = "JGI Building (Printing Press)";
  else if (normalized.includes("market") || normalized.includes("margret ekpo")) source = "Margret Ekpo Market";
  else if (normalized.includes("cec")) source = "CEC Administrative Building";
  else if (normalized.includes("water") || normalized.includes("borehole")) source = "Sub-station Borehole";

  // Destinations
  let destination = "Mariere Hall";
  if (normalized.includes("balewa")) destination = "Balewa Hall (Male)";
  else if (normalized.includes("slessor")) destination = "Mary Slessor Hall (Female)";
  else if (normalized.includes("eni njoku") || normalized.includes("njoku")) destination = "Eni Njoku Hall (Male)";
  else if (normalized.includes("nkrumah") || normalized.includes("kwame")) destination = "Kwame Nkrumah Hall (Postgrad/Female)";
  else if (normalized.includes("bello")) destination = "Bello Hall (Male)";
  else if (normalized.includes("alvan")) destination = "Alvan Ikoku Hall (Female)";

  // Errand types
  let errandType = "Custom Errand";
  if (normalized.includes("okpa") || normalized.includes("food") || normalized.includes("coke") || normalized.includes("dinner") || normalized.includes("buy to eat")) {
    errandType = "Food Delivery";
  } else if (normalized.includes("print") || normalized.includes("photocopy") || normalized.includes("manual") || normalized.includes("bind")) {
    errandType = "Printing & Binding";
  } else if (normalized.includes("water") || normalized.includes("hauling") || normalized.includes("jerrycan") || normalized.includes("bucket")) {
    errandType = "Water Hauling";
  } else if (normalized.includes("market") || normalized.includes("grocery") || normalized.includes("detergent") || normalized.includes("soap")) {
    errandType = "Grocery / Market Run";
  } else if (normalized.includes("submit") || normalized.includes("assignment") || normalized.includes("lecturer")) {
    errandType = "Academic Submission";
  }

  // Price extraction
  let price = 500;
  const priceMatches = text.match(/(?:₦|ngn|#|pay|for)\s*(\d+)/i) || text.match(/(\d+)\s*(?:naira|ngn|#)/i);
  if (priceMatches && priceMatches[1]) {
    price = parseInt(priceMatches[1]);
  } else {
    // Check if numbers like 400, 500, 600, 1000 exist in raw text
    const numbers = text.match(/\b(300|400|500|600|700|800|1000|1500|2000)\b/);
    if (numbers && numbers[1]) {
      price = parseInt(numbers[1]);
    }
  }

  // Strategy comments based on errand type and locations
  let feedback = `Constructed via local heuristics (Gemini key not configured). This run will proceed from ${source} to ${destination}. `;
  let complexity = "Medium logistics complexity.";
  let riskRating = "Standard";

  if (errandType === "Water Hauling") {
    complexity = "High wear-and-tear. Hauling 20L jerrycans up hostel stairs is physically demanding.";
    riskRating = "High Effort";
    feedback += "Recommendation: Surge pricing should be active (+₦250) to incentivize runners to carry water up stairs.";
  } else if (errandType === "Food Delivery") {
    complexity = "Time-sensitive. Needs delivery within 15-20 minutes to keep food hot.";
    riskRating = "Time Critical";
    feedback += "Chitis often has midday lines. Advise runner to prioritize quick pickup.";
  } else if (errandType === "Printing & Binding") {
    complexity = "Detail-oriented. Errors in custom print instructions cause runner-user disputes.";
    riskRating = "High Friction";
    feedback += "Requires PDF confirmation before print starts. WhatsApp photo proof is crucial.";
  }

  return {
    errandType,
    details: text.trim(),
    sourceLocation: source,
    destinationLocation: destination,
    payoutFee: price,
    urgencyText: normalized.includes("now") || normalized.includes("sharp") || normalized.includes("fast") ? "Urgent (20-30 mins)" : "Flexible",
    strategyCommentary: feedback,
    complexityRating: complexity,
    riskLevel: riskRating,
    usingFallback: true
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message string" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      // Key is not configured by user yet, fall back gracefully
      const parsed = fallbackParse(message);
      return NextResponse.json(parsed);
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const runnerPrompt = `
You are the central AI dispatch agent for "Runs", a student peer-to-peer errand network on a Nigerian campus (UNN style).
Your task is to analyze raw, organic student WhatsApp requests and extract structured dispatch schemas.

Example inputs and expected outputs:
Input: "Who is free to fetch two jerrycans of water to Mary Slessor Hall 2nd floor, I will pay 400 Naira fast"
Parsed: {
  "errandType": "Water Hauling",
  "details": "Fetch 2 jerrycans of water",
  "sourceLocation": "Borehole Station",
  "destinationLocation": "Mary Slessor Hall (Female)",
  "payoutFee": 400,
  "urgencyText": "Urgent",
  "strategyCommentary": "Water hauling up high-density hostel stairs (Mary Slessor) is physically exhausting. It should carry an increased fee.",
  "complexityRating": "Heavy physical labor. Requires substantial active effort.",
  "riskLevel": "High Effort"
}

Analyze this raw WhatsApp message from a student:
"${message}"

Extract the parameters into the exact schema specified.
Use authentic Nigerian campus terms in context if appropriate.
Estimate reasonable Naira values (if not specified, default to 500 NGN).
Specify real landmarks: Balewa Hall, Mary Slessor Hall, Eni Njoku Hall, Bello Hall, Alvan Hall, Kwame Nkrumah Hall, Chitis Fast Food, Franco Stalls, JGI Building (Printing Press), Margret Ekpo Market, Cecil Building, Gate.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: runnerPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            errandType: { 
              type: Type.STRING, 
              description: "Must be one of: Food Delivery, Printing & Binding, Water Hauling, Grocery / Market Run, Academic Submission, Custom Errand" 
            },
            details: { type: Type.STRING, description: "A summarized description of the request" },
            sourceLocation: { type: Type.STRING, description: "Likely source campus landmark" },
            destinationLocation: { type: Type.STRING, description: "Hostel or lecture hall destination" },
            payoutFee: { type: Type.INTEGER, description: "The fee offered (or reasonable default) in Naira integer (e.g. 500)" },
            urgencyText: { type: Type.STRING, description: "e.g., Urgent, Standard, Flexible" },
            strategyCommentary: { type: Type.STRING, description: "Systems-strategist advice about matching difficulty, WhatsApp dispatch group triggers, or recommended security tiers for this errand size." },
            complexityRating: { type: Type.STRING, description: "A short sentence describing why this errand is tricky or straightforward on a crowded campus." },
            riskLevel: { type: Type.STRING, description: "e.g. High Effort, Time Critical, High Friction, Standard" }
          },
          required: ["errandType", "details", "sourceLocation", "destinationLocation", "payoutFee", "urgencyText", "strategyCommentary", "complexityRating", "riskLevel"]
        }
      }
    });

    const rawResponseText = response.text ? response.text.trim() : "";
    const parsedResponse = JSON.parse(rawResponseText || "{}");
    return NextResponse.json({
      ...parsedResponse,
      usingFallback: false
    });

  } catch (error) {
    console.error("Error in server-side Gemini route:", error);
    // Silent recovery with fallback
    try {
      const fallbackResult = fallbackParse("Could not process request due to an error, but here is a default template.");
      return NextResponse.json(fallbackResult);
    } catch (e) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
}

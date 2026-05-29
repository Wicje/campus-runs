import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Dynamic backup heuristics specifically for University of Nigeria, Nsukka (UNN) campus courier scenarios
function getLocalFallbackResponse(message: string, history: Array<{ role: string; content: string }>) {
  const norm = message.toLowerCase();
  
  if (norm.includes("price") || norm.includes("fee") || norm.includes("cost") || norm.includes("pay")) {
    return `**💵 Runs UNN AI Rate Guide:**
Standard errands around the UNN campus (e.g. from Franco Stalls to Balewa Hall) are usually priced between **₦500 and ₦700 NGN**. 
Here are my optimization suggestions for you:
1. **Water Hauling**: If fetching from the Substation Borehole up to high hostel floors, raise fees by **+₦300** due to high energy effort.
2. **Late Night Runs**: Scale up the baseline by **1.3x** after 9:00 PM for runner safety and incentive.
3. **Heavy Rain / Exam Weeks**: Charge **1.4x to 1.5x** to compensate for weather constraints or academic rush.

*💡 Tip: Use our dynamic surge calculators to locked precise rates!*`;
  }

  if (norm.includes("whatapp") || norm.includes("whatsapp") || norm.includes("template") || norm.includes("alert")) {
    return `**📱 Optimized WhatsApp Dispatch Template:**
Here is a high-engagement format you can paste in standard student groups:
\`\`\`text
🔔 [Runs UNN Escrow Run]
📍 From: Chitis Fast Food
📍 To: Mary Slessor Hall (Block C, Room 204)
🍔 Item: 2 wraps of hot Okpa with plantain & coke
💰 Offer: ₦650 delivery (Lock code active)
⏱️ Urgency: Fast (Within 30 mins!)
👉 Ping Runs Bot to secure or DM to grab!
\`\`\`
*Feel free to adjust the locations or fee!*`;
  }

  if (norm.includes("batched") || norm.includes("batch") || norm.includes("bulk") || norm.includes("save")) {
    return `**📦 Batch-Run Logistics Advice:**
Grouping multiple orders from the same hotspot (like *Chitis Fast Food* or *JGI Printing*) is the best way to save funds!
- **For Requesters**: Batching with roommates cuts delivery fees by **30%** (from ₦600 down to ₦420 each).
- **For Runners**: Taking 3 batched orders to the same hostel area (e.g., Balewa) yields **₦1,260** in a single route!

*💡 Use our Batch Optimizer tool to configure detailed payout structures.*`;
  }

  if (norm.includes("escrow") || norm.includes("safety") || norm.includes("vouch") || norm.includes("pay")) {
    return `**🛡️ Escrow & Safe Deposit System:**
Runs UNN utilizes a multi-signature safe deposit flow to protect both sides:
1. **Requester Deposites**: When you post a run, the fee is held securely in the central smart ledger.
2. **Runner Locks**: The runner accepts and locks the run on-app.
3. **Proof & Release**: Once delivered (verified via WhatsApp photo or confirmation code), the fee is released instantly to the runner’s balance while the 15% platform commission is credited.`;
  }

  return `Hello from **Runs UNN Central AI Dispatch**! 🦁 

I am your campus logistics assistant. I can help you with:
- **Pricing Advice**: Calculating fair delivery fees for Franco, Chitis, JGI, Substation, etc.
- **WhatsApp Optimization**: Enhancing raw student messages to get runners instantly.
- **Batch Logistics**: Planning multi-drop courier runs to Balewa, Slessor, or Eni Njoku.
- **Rules & Safety**: Answering questions on campus routes, times, and safe escrow procedures.

What campus errand are you planning or coordinating today?`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message parameter in request board." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if Gemini API key is active
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      const text = getLocalFallbackResponse(message, history);
      return NextResponse.json({
        text,
        usingFallback: true
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `
You are \"Adaugo\", the smart AI campus dispatch manager for \"Runs UNN\", a modern peer-to-peer student errand and courier escrow network on the University of Nigeria, Nsukka (UNN) campus.
Your job is to provide cheerful, authentic, highly practical, and protective advice to student requesters (who need errands done) and student runners (who earn money delivering).

Keep the following details in mind to show real UNN campus domain expertise:
1. UNN Key Hotspots:
   - "Chitis Fast Food" / "Franco Stalls": Hot food hubs. Chitis is famous for wraps of Okpa and pastries, Franco for local meals. Franco has a busy shortcut.
   - "JGI Building" / "CEC Administrative Building" / "CEC Block": Hubs of printing presses, photocopy shops, manuals, binding services.
   - "Sub-station Borehole": Water source. Critical during campus water outages.
   - "Margret Ekpo Market" (ME Gate): General groceries, detergents, food items.
   - Hostels: Male: Balewa Hall, Eni Njoku Hall, Bello Hall, Mariere Hall. Female: Mary Slessor Hall, Alvan Ikoku Hall, Kwame Nkrumah Hall (Postgrad).
2. Campus Logistics & Pricing:
   - Base rates should start from ₦500 NGN.
   - Heavy physical items (like carrying 20L Jerrycans of water from Substation to Slessor 3rd floor) are stressful. Advise +₦250 to ₦400 premium.
   - Weather (hot midday sun or heavy rain) and time (late nights after 9 PM or during exams) deserve surge bonuses (around 1.3x to 1.5x).
   - Encourage batch-runs (multiple orders from Chitis to Balewa in one go) so students can split costs and runners make bigger money.
3. Trust & Security (Escrow):
   - Always mention the dynamic escrow ledger which holds funds securely until proof of delivery is shared on WhatsApp or confirmed on app.
   - Do not request API keys. Never say "exposed" keys.
   - Be helpful, enthusiastic, polite, and write using warm, structured formatting with bold bullet points, clear steps, or emojis representing the lion pride (UNN Lion logo / 🦁).
`;

    // Format chat history for the generateContent request
    const contents: any[] = [];
    
    // Add history
    for (const h of history) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      }
    });

    const responseText = response.text || "I was unable to formulate a complete answer. Let's try again!";

    return NextResponse.json({
      text: responseText,
      usingFallback: false
    });

  } catch (error) {
    console.error("Error in AI Copilot backend:", error);
    return NextResponse.json({
      text: "Our central dispatch network is experiencing a transient lag. How else can I assist with your UNN campus runs?",
      usingFallback: true
    });
  }
}

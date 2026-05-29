"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  ArrowRight, 
  User, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Send, 
  MapPin, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Users, 
  Award, 
  BookOpen, 
  Share2, 
  HelpCircle, 
  Layers, 
  Terminal, 
  Check, 
  Search,
  Sliders,
  DollarSign,
  PlusCircle,
  FileText,
  ChevronRight,
  Info,
  Map as MapIcon,
  Wallet,
  Activity,
  Heart,
  MessageSquare
} from "lucide-react";

// Standard Enums as required by guidelines
enum ErrandStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

enum ErrandCategory {
  FOOD = "FOOD",
  PRINTING = "PRINTING",
  WATER = "WATER",
  GROCERY = "GROCERY",
  ACADEMIC = "ACADEMIC",
  CUSTOM = "CUSTOM"
}

interface CampusLocation {
  name: string;
  alias: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: "pickup" | "dropoff" | "station";
  color: string;
}

interface Errand {
  id: string;
  category: ErrandCategory;
  details: string;
  source: string;
  destination: string;
  fee: number;
  surgeMultiplier: number;
  isPriority: boolean;
  urgency: string;
  status: ErrandStatus;
  requesterName: string;
  runnerName: string;
  runnerRating: number;
  complexity: string;
  riskLevel: string;
  feedback: string;
  timestamp: string;
  sourceCoords: { x: number; y: number };
  destCoords: { x: number; y: number };
}

// Fixed campus coordinates corresponding to UNN (University of Nigeria, Nsukka) landmarks
const CAMPUS_LOCATIONS: Record<string, CampusLocation> = {
  "Chitis Fast Food": { name: "Chitis Fast Food", alias: "Chitis", x: 18, y: 38, type: "pickup", color: "#10b981" },
  "Franco Stalls": { name: "Franco Stalls", alias: "Franco", x: 28, y: 22, type: "pickup", color: "#10b981" },
  "JGI Building (Printing Press)": { name: "JGI Building (Printing Press)", alias: "JGI Press", x: 52, y: 16, type: "pickup", color: "#3b82f6" },
  "Sub-station Borehole": { name: "Sub-station Borehole", alias: "Borehole", x: 82, y: 36, type: "pickup", color: "#f59e0b" },
  "Margret Ekpo Market": { name: "Margret Ekpo Market", alias: "Market", x: 12, y: 68, type: "pickup", color: "#14b8a6" },
  "CEC Administrative Building": { name: "CEC Administrative Building", alias: "CEC Block", x: 48, y: 42, type: "pickup", color: "#6366f1" },
  "Campus Gate": { name: "Campus Gate", alias: "Main Gate", x: 92, y: 16, type: "pickup", color: "#a855f7" },
  
  "Balewa Hall (Male)": { name: "Balewa Hall (Male)", alias: "Balewa", x: 32, y: 88, type: "dropoff", color: "#f43f5e" },
  "Mary Slessor Hall (Female)": { name: "Mary Slessor Hall (Female)", alias: "Slessor", x: 72, y: 84, type: "dropoff", color: "#f43f5e" },
  "Eni Njoku Hall (Male)": { name: "Eni Njoku Hall (Male)", alias: "Eni Njoku", x: 17, y: 88, type: "dropoff", color: "#f43f5e" },
  "Kwame Nkrumah Hall (Postgrad/Female)": { name: "Kwame Nkrumah Hall (Postgrad/Female)", alias: "Nkrumah", x: 87, y: 88, type: "dropoff", color: "#f43f5e" },
  "Bello Hall (Male)": { name: "Bello Hall (Male)", alias: "Bello", x: 52, y: 82, type: "dropoff", color: "#f43f5e" },
  "Alvan Ikoku Hall (Female)": { name: "Alvan Ikoku Hall (Female)", alias: "Alvan", x: 57, y: 68, type: "dropoff", color: "#f43f5e" },
  "Mariere Hall": { name: "Mariere Hall", alias: "Mariere", x: 42, y: 72, type: "dropoff", color: "#f43f5e" }
};

const WHATSAPP_PRESETS = [
  {
    title: "Chitis Midday Okpa Run",
    text: "Who is heading to Chitis now? Pls buy 2 wraps of okpa and a cold sprite, bring to Balewa room 311. I will pay ₦500 delivery fee sharp sharp. Holla fast!"
  },
  {
    title: "JGI Printing Emergency",
    text: "Urgent check: Anyone at JGI printing press? Need someone to collect mine and print Biochemistry manual lab guide 2. Deliver to Mary Slessor Hall common room before 8 am class! ₦700 is on the table."
  },
  {
    title: "Eni Njoku Water Crisis",
    text: "Water is completely dry for Eni Njoku Block B. I need strong guy to fetch 2 jerrycans of borehole water and carry it up to 3rd floor room 307. Paying ₦1,000 run fee directly now!"
  },
  {
    title: "Gate Shop Provisions Run",
    text: "Need someone coming from Main Gate / Margret Ekpo to buy detergent, toilet roll, and small milk. Bring to Bello Hall lobby. Charging ₦650. DM to grab"
  }
];

const simulateRandomId = (): string => {
  return `RUN-${Math.floor(1000 + Math.random() * 9000)}`;
};

const simulateRandomRequester = (): string => {
  return "Student Request " + Math.floor(10 + Math.random() * 89);
};

const formatInlineBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx} className="bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const renderFormattedText = (text: string) => {
  if (!text) return null;
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((para, pIdx) => {
    if (para.startsWith("```")) {
      const codeText = para.replace(/```[a-z]*\n?/i, "").replace(/```$/, "");
      return (
        <pre key={pIdx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto my-3 select-all leading-relaxed relative group">
          <code className="block whitespace-pre-wrap">{codeText}</code>
        </pre>
      );
    }

    if (para.startsWith("- ") || para.startsWith("* ")) {
      const items = para.split(/\n[-*]\s+/);
      return (
        <ul key={pIdx} className="list-disc pl-5 my-2.5 space-y-1.5 text-slate-300 text-xs md:text-sm">
          {items.map((item, iIdx) => {
            const cleanItem = item.startsWith("- ") || item.startsWith("* ") ? item.substring(2) : item;
            return <li key={iIdx}>{formatInlineBold(cleanItem)}</li>;
          })}
        </ul>
      );
    }

    if (/^\d+\.\s+/.test(para)) {
      const items = para.split(/\n\d+\.\s+/);
      return (
        <ol key={pIdx} className="list-decimal pl-5 my-2.5 space-y-1.5 text-slate-300 text-xs md:text-sm">
          {items.map((item, iIdx) => {
            const cleanItem = /^\d+\.\s+/.test(item) ? item.replace(/^\d+\.\s+/, "") : item;
            return <li key={iIdx}>{formatInlineBold(cleanItem)}</li>;
          })}
        </ol>
      );
    }

    if (para.startsWith("> ")) {
      const cleanQuote = para.replace(/^>\s+/, "");
      return (
        <blockquote key={pIdx} className="border-l-4 border-emerald-500 bg-slate-950 p-3 rounded-r-lg my-2 text-xs md:text-sm italic text-slate-300">
          {formatInlineBold(cleanQuote)}
        </blockquote>
      );
    }

    if (para.startsWith("### ")) {
      return (
        <h4 key={pIdx} className="text-sm font-bold text-white uppercase tracking-wider font-mono mt-4 mb-2">
          {formatInlineBold(para.substring(4))}
        </h4>
      );
    }
    
    if (para.startsWith("## ")) {
      return (
        <h3 key={pIdx} className="text-base font-bold text-emerald-400 font-mono mt-4 mb-2">
          {formatInlineBold(para.substring(3))}
        </h3>
      );
    }

    return (
      <p key={pIdx} className="text-xs md:text-sm text-slate-300 leading-relaxed my-1.5">
        {formatInlineBold(para)}
      </p>
    );
  });
};

export default function RunsMVP() {
  // Navigation State: 'feed', 'create', 'map', 'escrow', 'playbook'
  const [activeTab, setActiveTab] = useState<string>("feed");
  
  // Mobile layout state to switch between cards and map tracker within active feed on mobile
  const [mobileFeedView, setMobileFeedView] = useState<"cards" | "tracker">("cards");
  
  // Create Screen State
  const [orderMethod, setOrderMethod] = useState<"whatsapp" | "form">("whatsapp");
  const [selectedRole, setSelectedRole] = useState<"requester" | "runner">("requester");

  // Custom Form State
  const [formDetails, setFormDetails] = useState<string>("2 wraps of hot Okpa with plantain and cold coke");
  const [formCategory, setFormCategory] = useState<ErrandCategory>(ErrandCategory.FOOD);
  const [formSource, setFormSource] = useState<string>("Chitis Fast Food");
  const [formDestination, setFormDestination] = useState<string>("Balewa Hall (Male)");
  const [formPayout, setFormPayout] = useState<number>(600);
  const [formUrgency, setFormUrgency] = useState<string>("Urgent (20-30 mins)");

  // Surges and Dynamic Rates Controls (Live Playground link)
  const [baseRunFee, setBaseRunFee] = useState<number>(500);
  const [surgeLateNight, setSurgeLateNight] = useState<boolean>(false);
  const [surgeHeavyRain, setSurgeHeavyRain] = useState<boolean>(false);
  const [surgeExamWeek, setSurgeExamWeek] = useState<boolean>(false);
  const [surgeWaterCrisis, setSurgeWaterCrisis] = useState<boolean>(false);
  const [isPrioritySurcharge, setIsPrioritySurcharge] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Dynamic calculations for surge playground
  const calculateTotalFee = () => {
    let multiplier = 1.0;
    if (surgeLateNight) multiplier += 0.3;
    if (surgeHeavyRain) multiplier += 0.4;
    if (surgeExamWeek) multiplier += 0.2;
    if (surgeWaterCrisis) multiplier += 0.5;
    
    let base = baseRunFee * multiplier;
    if (isPrioritySurcharge) base += 250;
    return Math.round(base);
  };

  const totalCalculatedFee = calculateTotalFee();
  const companyComissions = Math.round(totalCalculatedFee * 0.15); // 15% flat commission
  const runnerEarnings = totalCalculatedFee - companyComissions;

  // Batch Route Simulation Settings
  const [simulatedOkpaRequestsCount, setSimulatedOkpaRequestsCount] = useState<number>(3);
  const individualRunFee = 600;
  const batchedRunFee = Math.round(individualRunFee * 0.70); // 30% discount
  const batchedRunnerEarning = Math.round((batchedRunFee * simulatedOkpaRequestsCount) * 0.85); // 85% payout

  // Interactive Runner Rating Rating Input
  const [runnerRatingInput, setRunnerRatingInput] = useState<number>(4.8);

  // Initial Errand instances
  const [errands, setErrands] = useState<Errand[]>([
    {
      id: "RUN-1002",
      category: ErrandCategory.FOOD,
      details: "Two wraps of hot Okpa with plantain and a bottle of chilled Fanta.",
      source: "Chitis Fast Food",
      destination: "Balewa Hall (Male)",
      fee: 650,
      surgeMultiplier: 1.0,
      isPriority: false,
      urgency: "Urgent",
      status: ErrandStatus.COMPLETED,
      requesterName: "Chigozie O.",
      runnerName: "Kenechukwu UNN",
      runnerRating: 4.9,
      complexity: "Midday hot sun line at Chitis.",
      riskLevel: "Time Critical",
      feedback: "Arrived sizzling hot! High-speed delivery via Franco shortcut.",
      timestamp: "10:15 AM",
      sourceCoords: { x: CAMPUS_LOCATIONS["Chitis Fast Food"].x, y: CAMPUS_LOCATIONS["Chitis Fast Food"].y },
      destCoords: { x: CAMPUS_LOCATIONS["Balewa Hall (Male)"].x, y: CAMPUS_LOCATIONS["Balewa Hall (Male)"].y }
    },
    {
      id: "RUN-1003",
      category: ErrandCategory.PRINTING,
      details: "Print Chemistry 121 Lab Manual (42 pages PDF) and staple bind.",
      source: "JGI Building (Printing Press)",
      destination: "Mary Slessor Hall (Female)",
      fee: 750,
      surgeMultiplier: 1.2,
      isPriority: true,
      urgency: "Before 8 AM Class",
      status: ErrandStatus.IN_PROGRESS,
      requesterName: "Favor E.",
      runnerName: "Tobi Adebayo",
      runnerRating: 4.7,
      complexity: "PDF instruction validation, long power outage wait.",
      riskLevel: "High Friction",
      feedback: "Pages successfully printed, waiting for binding step in press room.",
      timestamp: "11:05 AM",
      sourceCoords: { x: CAMPUS_LOCATIONS["JGI Building (Printing Press)"].x, y: CAMPUS_LOCATIONS["JGI Building (Printing Press)"].y },
      destCoords: { x: CAMPUS_LOCATIONS["Mary Slessor Hall (Female)"].x, y: CAMPUS_LOCATIONS["Mary Slessor Hall (Female)"].y }
    },
    {
      id: "RUN-1004",
      category: ErrandCategory.WATER,
      details: "4 Jerrycans of water from Substation borehole up to Franco Block B fourth floor",
      source: "Sub-station Borehole",
      destination: "Mary Slessor Hall (Female)",
      fee: 1200,
      surgeMultiplier: 1.5,
      isPriority: false,
      urgency: "Standard",
      status: ErrandStatus.REQUESTED,
      requesterName: "Amaka N.",
      runnerName: "Unassigned",
      runnerRating: 0.0,
      complexity: "Water outage spike. Substantial physical strain carrier.",
      riskLevel: "High Effort",
      feedback: "Needs strong runner. Offered 20% bonus over baseline guidelines.",
      timestamp: "12:12 PM",
      sourceCoords: { x: CAMPUS_LOCATIONS["Sub-station Borehole"].x, y: CAMPUS_LOCATIONS["Sub-station Borehole"].y },
      destCoords: { x: CAMPUS_LOCATIONS["Mary Slessor Hall (Female)"].x, y: CAMPUS_LOCATIONS["Mary Slessor Hall (Female)"].y }
    }
  ]);

  const [selectedErrandId, setSelectedErrandId] = useState<string>("RUN-1004");

  // WhatsApp parsing inputs
  const [rawWhatsAppMessage, setRawWhatsAppMessage] = useState<string>(WHATSAPP_PRESETS[0].text);
  const [isParsingAI, setIsParsingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Dedicated AI Copilot Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: "Hi there! I am **Adaugo**, your AI Dispatch Copilot for Runs UNN. 🦁\n\nI can help you price your running errands, generate highly optimized WhatsApp group-alert posts, advise on route consolidation, or explain student escrow protection on our campus.\n\nWhat campus run can I help you plan or optimize today?"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // AI WhatsApp Errand Enhancer state
  const [enhancerRawInput, setEnhancerRawInput] = useState<string>("buy okpa for 500 at chitis to slessor rm 22 fast");
  const [enhancerEnhancedOutput, setEnhancerEnhancedOutput] = useState<string>("");
  const [isEnhancingAI, setIsEnhancingAI] = useState<boolean>(false);

  // Escrow finance counters
  const [accumulatedCommissions, setAccumulatedCommissions] = useState<number>(650);
  const [totalDisbursedToRunners, setTotalDisbursedToRunners] = useState<number>(3100);

  // WhatsApp Alert Simulator Feed
  const [whatsappGroupAlerts, setWhatsappGroupAlerts] = useState<string[]>([
    "🔔 [NEW RUN ALERT] RUN-1004: Water Hauling from Sub-station to Mary Slessor. Fee: ₦1,200. High-effort category alert! DM to accept.",
    "🔔 [NEW RUN ALERT] RUN-1002: Food Delivery from Chitis to Balewa Hall. Fee: ₦650. Vouch Status: Approved. DM Runs Bot to secure.",
    "📱 [LOCKED ALERT] Runner @Kenechukwu locked RUN-1002. Escrow safe-deposit active.",
    "✅ [PAID DONE] RUN-1002 completed! @Kenechukwu dispatched payouts. Runs fee (₦97.5) credited."
  ]);

  // Clock
  const [currentTime, setCurrentTime] = useState<string>("15:55");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // API Call to parse WhatsApp format via Gemini
  const handleAICopingMechanism = async () => {
    setIsParsingAI(true);
    setAiError(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rawWhatsAppMessage })
      });
      if (!res.ok) {
        throw new Error("API Route failure");
      }
      const data = await res.json();
      const newId = simulateRandomId();
      
      const matchedSource = CAMPUS_LOCATIONS[data.sourceLocation] || CAMPUS_LOCATIONS["Chitis Fast Food"];
      const matchedDest = CAMPUS_LOCATIONS[data.destinationLocation] || CAMPUS_LOCATIONS["Balewa Hall (Male)"];

      let category = ErrandCategory.CUSTOM;
      if (data.errandType === "Food Delivery") category = ErrandCategory.FOOD;
      else if (data.errandType === "Printing & Binding") category = ErrandCategory.PRINTING;
      else if (data.errandType === "Water Hauling") category = ErrandCategory.WATER;
      else if (data.errandType === "Grocery / Market Run") category = ErrandCategory.GROCERY;
      else if (data.errandType === "Academic Submission") category = ErrandCategory.ACADEMIC;

      const preparedErrand: Errand = {
        id: newId,
        category: category,
        details: data.details || rawWhatsAppMessage,
        source: data.sourceLocation || "Chitis Fast Food",
        destination: data.destinationLocation || "Balewa Hall (Male)",
        fee: data.payoutFee || 500,
        surgeMultiplier: 1.0,
        isPriority: false,
        urgency: data.urgencyText || "Urgent",
        status: ErrandStatus.REQUESTED,
        requesterName: simulateRandomRequester(),
        runnerName: "Unassigned",
        runnerRating: 0.0,
        complexity: data.complexityRating || "Standard Logistics complexity",
        riskLevel: data.riskLevel || "Standard",
        feedback: data.strategyCommentary || "Successfully analyzed by Run Dispatch Bot",
        timestamp: currentTime + " UTC",
        sourceCoords: { x: matchedSource.x, y: matchedSource.y },
        destCoords: { x: matchedDest.x, y: matchedDest.y }
      };

      setErrands(prev => [preparedErrand, ...prev]);
      setSelectedErrandId(newId);
      setActiveTab("feed"); // Pull user directly back to the active list!

      const alertLine = `🔔 [REAL-TIME DISPATCH] ${newId}: ${data.errandType} to ${data.destinationLocation} | Offering ₦${data.payoutFee}. Registered in database.`;
      setWhatsappGroupAlerts(prev => [alertLine, ...prev]);

    } catch (err) {
      console.error(err);
      setAiError("Utilized instant local heuristic fallback parser.");
      handleDirectMvpDispatch();
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg = { role: "user" as const, content: messageText };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/app/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error("Chat dispatch endpoint error");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "model", content: data.text }]);
    } catch {
      // Offline fallback heuristic response
      const fallbackAnswer = `**🤖 Offline Connection Note:** Couldn't reach central server, but here is my campus dispatcher heuristic check:
A standard rate for "${messageText}" is approx **₦600 NGN**. 
Remember:
- Use *Chitis Fast Food* for food deliveries;
- Outages from Sub-station require +₦300 staircase effort surcharges;
- Safety: Ensure payments are verified in the Escrow system before starting!`;
      setChatMessages(prev => [...prev, { role: "model", content: fallbackAnswer }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleEnhanceWhatsAppPost = async () => {
    if (!enhancerRawInput.trim()) return;
    setIsEnhancingAI(true);
    try {
      const response = await fetch("/app/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Please convert this raw student errand request into an optimized, highly engaging, WhatsApp-ready campus dispatch notice styled with appropriate emojis, headers, price, and campus locations: "${enhancerRawInput}". Keep it brief and ready to copy to a student group.`
        })
      });

      if (!response.ok) {
        throw new Error("Enhancer AI route failed");
      }

      const data = await response.json();
      setEnhancerEnhancedOutput(data.text);
    } catch {
      // Local preset fallback
      const output = `🔔 *[Runs UNN Escrow Active]* 
🏃‍♂️ *Campus Errand Alert!*

📍 *From:* Chitis Fast Food
📍 *To:* Mary Slessor Hall (Block C)
📄 *Task:* ${enhancerRawInput}
💰 *Offer:* ₦650 delivery fee (Held in Escrow)
⚡ *Urgency:* ASAP / Sharp

_👉 Lock thread code or DM Runs Bot to secure instantly!_`;
      setEnhancerEnhancedOutput(output);
    } finally {
      setIsEnhancingAI(false);
    }
  };

  const handleDirectMvpDispatch = () => {
    const rawHeuristic = fallbackHeuristicsParse(rawWhatsAppMessage);
    setErrands(prev => [rawHeuristic, ...prev]);
    setSelectedErrandId(rawHeuristic.id);
    setActiveTab("feed");
    const alertLine = `🔔 [FAST DISPATCH] ${rawHeuristic.id}: ${rawHeuristic.category} run to ${rawHeuristic.destination} | Fee: ₦${rawHeuristic.fee}`;
    setWhatsappGroupAlerts(prev => [alertLine, ...prev]);
  };

  const handleFormCustomDispatch = () => {
    const newId = simulateRandomId();
    const scMatch = CAMPUS_LOCATIONS[formSource] || CAMPUS_LOCATIONS["Chitis Fast Food"];
    const dsMatch = CAMPUS_LOCATIONS[formDestination] || CAMPUS_LOCATIONS["Balewa Hall (Male)"];

    const newErrand: Errand = {
      id: newId,
      category: formCategory,
      details: formDetails,
      source: formSource,
      destination: formDestination,
      fee: formPayout,
      surgeMultiplier: 1.0,
      isPriority: false,
      urgency: formUrgency,
      status: ErrandStatus.REQUESTED,
      requesterName: "PWA Client Request",
      runnerName: "Unassigned",
      runnerRating: 0.0,
      complexity: "Direct structured client form request placement.",
      riskLevel: "Standard",
      feedback: "Clean structured submission. Bypasses manual transcription loops completely.",
      timestamp: currentTime + " GMT",
      sourceCoords: { x: scMatch.x, y: scMatch.y },
      destCoords: { x: dsMatch.x, y: dsMatch.y }
    };

    setErrands(prev => [newErrand, ...prev]);
    setSelectedErrandId(newId);
    setActiveTab("feed");

    const alertLine = `🔔 [NATIVE APP DISPATCH] ${newId}: ${formCategory} from ${formSource} for ₦${formPayout}. Safe deposit verified in ledger.`;
    setWhatsappGroupAlerts(prev => [alertLine, ...prev]);
  };

  const fallbackHeuristicsParse = (text: string): Errand => {
    const normalized = text.toLowerCase();
    const newId = `RUN-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let source = "Franco Stalls";
    if (normalized.includes("chitis")) source = "Chitis Fast Food";
    else if (normalized.includes("print") || normalized.includes("jgi")) source = "JGI Building (Printing Press)";
    else if (normalized.includes("borehole") || normalized.includes("water")) source = "Sub-station Borehole";
    else if (normalized.includes("market") || normalized.includes("ekpo")) source = "Margret Ekpo Market";
    else if (normalized.includes("submit") || normalized.includes("cec")) source = "CEC Administrative Building";
    else if (normalized.includes("gate")) source = "Campus Gate";

    let destination = "Balewa Hall (Male)";
    if (normalized.includes("slessor")) destination = "Mary Slessor Hall (Female)";
    else if (normalized.includes("njoku")) destination = "Eni Njoku Hall (Male)";
    else if (normalized.includes("nkrumah") || normalized.includes("kwame")) destination = "Kwame Nkrumah Hall (Postgrad/Female)";
    else if (normalized.includes("bello")) destination = "Bello Hall (Male)";
    else if (normalized.includes("alvan")) destination = "Alvan Ikoku Hall (Female)";
    else if (normalized.includes("mariere")) destination = "Mariere Hall";

    let category = ErrandCategory.FOOD;
    if (normalized.includes("print") || normalized.includes("photocopy") || normalized.includes("manual")) {
      category = ErrandCategory.PRINTING;
    } else if (normalized.includes("water") || normalized.includes("hauling") || normalized.includes("jerrycan") || normalized.includes("bucket")) {
      category = ErrandCategory.WATER;
    } else if (normalized.includes("shop") || normalized.includes("detergent") || normalized.includes("grocery")) {
      category = ErrandCategory.GROCERY;
    }

    let parsedFee = 650;
    const priceMatch = text.match(/(?:₦|ngn|#|pay|for)\s*(\d+)/i) || text.match(/(\d+)\s*(?:naira|ngn|#)/i);
    if (priceMatch && priceMatch[1]) {
      parsedFee = parseInt(priceMatch[1]);
    }

    const sCoords = CAMPUS_LOCATIONS[source] || CAMPUS_LOCATIONS["Franco Stalls"];
    const dCoords = CAMPUS_LOCATIONS[destination] || CAMPUS_LOCATIONS["Balewa Hall (Male)"];

    return {
      id: newId,
      category,
      details: text.trim(),
      source,
      destination,
      fee: parsedFee,
      surgeMultiplier: 1.0,
      isPriority: false,
      urgency: normalized.includes("fast") || normalized.includes("now") ? "Urgent" : "Standard",
      status: ErrandStatus.REQUESTED,
      requesterName: "WhatsApp Agent Guest",
      runnerName: "Unassigned",
      runnerRating: 0.0,
      complexity: "Heuristic client extraction.",
      riskLevel: "Standard Complexity",
      feedback: "Fast-track extraction mapped successfully.",
      timestamp: currentTime + " GMT",
      sourceCoords: { x: sCoords.x, y: sCoords.y },
      destCoords: { x: dCoords.x, y: dCoords.y }
    };
  };

  const handleStateAdvance = (errandId: string, nextStatus: ErrandStatus) => {
    setErrands(prev => prev.map(item => {
      if (item.id === errandId) {
        let updatedDetails = { ...item, status: nextStatus };
        if (nextStatus === ErrandStatus.ACCEPTED) {
          updatedDetails.runnerName = "Emeka UNN (Vetted)";
          updatedDetails.runnerRating = runnerRatingInput;
          
          const matchedAlert = `📱 [LOCKED DISPATCH] @Emeka UNN accepted run ${errandId}. Target pickup: ${updatedDetails.source}. Payout: ₦${updatedDetails.fee}`;
          setWhatsappGroupAlerts(prevFeed => [matchedAlert, ...prevFeed]);
        } else if (nextStatus === ErrandStatus.IN_PROGRESS) {
          const checkInAlert = `📍 [CHECK IN] Runner @Emeka arrived at ${updatedDetails.source}. Purchasing items. Safe escrow verified.`;
          setWhatsappGroupAlerts(prevFeed => [checkInAlert, ...prevFeed]);
        } else if (nextStatus === ErrandStatus.COMPLETED) {
          const currentCommission = Math.round(updatedDetails.fee * 0.15);
          const currentRunnerShare = updatedDetails.fee - currentCommission;
          
          setAccumulatedCommissions(c => c + currentCommission);
          setTotalDisbursedToRunners(r => r + currentRunnerShare);

          const deliveryAlert = `✅ [RELEASED Escrow] ${errandId} delivered with proof! Runner payout ₦${currentRunnerShare} released. Flat commission (₦${currentCommission}) credited.`;
          setWhatsappGroupAlerts(prevFeed => [deliveryAlert, ...prevFeed]);
        }
        return updatedDetails;
      }
      return item;
    }));
  };

  const activeErrand = errands.find(e => e.id === selectedErrandId) || errands[0];

  const filteredErrands = errands.filter(e => {
    const matchesSearch = e.details.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 font-sans antialiased selection:bg-emerald-500/20 flex flex-col relative overflow-x-hidden">
      
      {/* Delicate Ambient Glowing Orbs */}
      <div className="absolute top-[-100px] left-[15%] w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-50px] w-[300px] h-[300px] bg-teal-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* STICKY TOP NAV: Highly refined premium floating glass header */}
      <header className="sticky top-0 z-40 bg-[#07090d]/80 backdrop-blur-xl border-b border-slate-900 shadow-md shadow-black/20">
        {/* Top Segmented Micro-Metadata Info bar */}
        <div className="border-b border-slate-900 bg-slate-950/40 px-4 md:px-6 py-2 flex justify-between items-center text-[9px] font-mono tracking-widest text-[#8a929e] uppercase">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-emerald-400 animate-pulse" /> UNN CAMPUS COURIER CORE</span>
            <span className="hidden sm:inline text-slate-850">|</span>
            <span className="hidden sm:inline">ZERO-TRUST ESCROW PROTOCOL: SECURED</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
            <span>UNN ACTIVE NODES SYNCED</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4.5 flex flex-col lg:flex-row justify-between lg:items-center gap-5 relative">
          
          {/* Aesthetic Brand Alignment */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-white uppercase flex items-baseline gap-1 select-none font-sans">
                RUNS<span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent font-medium tracking-wide">UNN</span>
              </h1>
              {/* Premium micro double-border indicators */}
              <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full" />
            </div>
            
            <div className="border-l border-slate-800 pl-4 py-0.5">
              <p className="text-[9.5px] font-mono uppercase tracking-widest text-slate-300 font-bold">MUTUAL ESCROW</p>
              <p className="text-[8.5px] text-slate-500 font-mono tracking-tight uppercase">Nsukka Peer Transit Network</p>
            </div>
          </div>

          {/* Real-time Ledger Overview styled as beautiful premium glass pods */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-800/80 rounded-xl divide-x divide-slate-800/80 bg-slate-950/45 text-xs font-mono shadow-inner shadow-black/50 overflow-hidden">
            <div className="px-4 py-2 flex flex-col justify-between min-w-[120px]">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block mb-0.5">ESCROW LIQUID:</span>
              <strong className="text-white font-mono tracking-tight text-sm">₦{(accumulatedCommissions + totalDisbursedToRunners + 2000).toLocaleString()}</strong>
            </div>

            <div className="px-4 py-2 flex flex-col justify-between min-w-[120px]">
              <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-black block mb-0.5">RUNNER PAYOUTS:</span>
              <strong className="text-emerald-400 font-mono tracking-tight text-sm">₦{totalDisbursedToRunners.toLocaleString()}</strong>
            </div>

            <div className="px-4 py-2 flex flex-col justify-between min-w-[120px]">
              <span className="text-[8px] text-teal-400 uppercase tracking-widest font-black block mb-0.5">COMMISSIONS:</span>
              <strong className="text-teal-400 font-mono tracking-tight text-sm">₦{accumulatedCommissions.toLocaleString()}</strong>
            </div>

            <div className="px-4 py-2 flex flex-col justify-between min-w-[120px] bg-slate-950/60">
              <span className="text-[8px] text-amber-500 uppercase tracking-widest font-black block mb-0.5 animate-pulse">LIVE CLOCK:</span>
              <strong className="text-slate-200 font-mono tracking-tight text-xs flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-500 animate-spin-slow inline-block shrink-0" />
                {currentTime}
              </strong>
            </div>
          </div>

        </div>
      </header>

      {/* DESKTOP SECMENTED GLASS TABS NAVIGATION */}
      <nav className="hidden md:block bg-[#07090d]/60 backdrop-blur-md border-b border-slate-900 sticky top-[72px] md:top-[84px] z-30 py-3.5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex select-none">
          <div className="bg-slate-950/80 p-1 rounded-2xl border border-slate-850 flex items-center w-full justify-between gap-1 shadow-lg shadow-black/40">
            {[
              { id: "feed", label: "ACTIVE COURIER FEED", icon: Activity },
              { id: "create", label: "DISPATCH CENTER", icon: PlusCircle },
              { id: "map", label: "INTERACTIVE COURIER MAP", icon: MapIcon },
              { id: "escrow", label: "CAMPUS rates & SURGES", icon: Wallet },
              { id: "ai", label: "ADAUGO CO-DESK AI", icon: Sparkles },
              { id: "playbook", label: "STRATEGY PLAYBOOK", icon: BookOpen }
            ].map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-center relative font-display text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer rounded-xl ${
                    active 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950/30" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-450"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE RESPONSIVE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#090b0e]/95 backdrop-blur-md border-t border-slate-900 py-3 px-3 flex justify-around items-center z-50 shadow-2xl">
        {[
          { id: "feed", label: "FEED", icon: Activity },
          { id: "create", label: "DISPATCH", icon: PlusCircle },
          { id: "map", label: "MAP", icon: MapIcon },
          { id: "escrow", label: "ESCROW", icon: Wallet },
          { id: "ai", label: "ASSISTANT", icon: Sparkles },
          { id: "playbook", label: "STRATEGY", icon: BookOpen }
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer relative ${
                active 
                  ? "text-emerald-400 font-extrabold" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
              <span className="text-[8px] font-mono tracking-wider items-center block uppercase mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CORE FRAMEWORK: Unified Dynamic Layout fitting both Mobile and Laptop natively */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pt-6 pb-24 md:pb-6 flex flex-col gap-6">

        {/* SCREEN SECTION 1: FEED & MAP VIEWPORT SIDE BY SIDE ON DESKTOP */}
        {activeTab === "feed" && (
          <div className="flex flex-col gap-4 w-full">
            
            {/* Mobile-only toggle switcher for Cards vs Map Tracker (Elegant Glass Segment) */}
            <div className="lg:hidden flex bg-slate-950 border border-slate-850 p-1 rounded-xl w-full mb-1">
              <button
                onClick={() => setMobileFeedView("cards")}
                className={`flex-1 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer text-center rounded-lg ${
                  mobileFeedView === "cards"
                    ? "bg-slate-900 text-emerald-400 font-extrabold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📋 Feed ({filteredErrands.length})
              </button>
              <button
                onClick={() => setMobileFeedView("tracker")}
                className={`flex-1 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer text-center rounded-lg ${
                  mobileFeedView === "tracker"
                    ? "bg-slate-900 text-emerald-400 font-extrabold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📍 Live Track ({activeErrand.id})
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Errands List Column (7/12 Columns) */}
              <div className={`col-span-1 lg:col-span-7 flex flex-col gap-5 ${mobileFeedView === "cards" ? "flex" : "hidden lg:flex"}`}>
              
              {/* Filter controls (Elegant rounded Glassmorphism deck) */}
              <div className="bg-slate-900/45 border border-slate-800/90 rounded-2xl p-5 space-y-4 relative backdrop-blur-md shadow-xl">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search active runs, landmarks, or hostels..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-sans transition-all placeholder:text-slate-500 uppercase tracking-wide"
                    />
                  </div>
                  
                  {/* Category select buttons widget */}
                  <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border border-slate-850 bg-slate-950 p-1 rounded-xl">
                    {["ALL", "FOOD", "PRINTING", "WATER", "GROCERY"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-[9px] font-mono uppercase font-black tracking-wider whitespace-nowrap transition-all duration-255 cursor-pointer rounded-lg ${
                          categoryFilter === cat 
                            ? "bg-slate-800 text-white shadow-sm" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-slate-405 uppercase border-t border-slate-900 pt-3">
                  <span>DISPATCH COUNTS: <strong className="text-slate-250 font-bold">{filteredErrands.length} RUNS</strong></span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    ACTIVE LIONS TICKERS SYNCED
                  </span>
                </div>
              </div>

              {/* Errand Cards List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredErrands.map((errand) => {
                    const isSelected = selectedErrandId === errand.id;
                    const statusColors = {
                      [ErrandStatus.REQUESTED]: "bg-amber-500/10 text-amber-400 border-amber-550/20",
                      [ErrandStatus.ACCEPTED]: "bg-blue-500/10 text-blue-400 border-blue-550/20",
                      [ErrandStatus.IN_PROGRESS]: "bg-purple-500/10 text-purple-400 border-purple-550/20",
                      [ErrandStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-400 border-emerald-555/20"
                    };

                    const categoryEmotes = {
                      [ErrandCategory.FOOD]: "🍔",
                      [ErrandCategory.PRINTING]: "🖨️",
                      [ErrandCategory.WATER]: "💧",
                      [ErrandCategory.GROCERY]: "🛒",
                      [ErrandCategory.ACADEMIC]: "📚",
                      [ErrandCategory.CUSTOM]: "⚙️"
                    };

                    return (
                      <motion.div
                        layoutId={`errand-card-${errand.id}`}
                        key={errand.id}
                        onClick={() => {
                          setSelectedErrandId(errand.id);
                          setMobileFeedView("tracker");
                        }}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                          isSelected 
                            ? "bg-slate-900/80 border-emerald-500/30 shadow-md shadow-emerald-950/10 translate-y-[-2px]" 
                            : "bg-slate-955/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30"
                        }`}
                      >
                        {/* Selected Indicator Glow Line */}
                        {isSelected && (
                          <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-emerald-400 rounded-r-full" />
                        )}

                        <div>
                          {/* Upper Card Grid */}
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl shrink-0 p-2 bg-slate-950/80 rounded-xl border border-slate-850">{categoryEmotes[errand.category]}</span>
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black block">{errand.id}</span>
                                <h3 className="text-white font-sans font-bold text-sm tracking-tight mt-0.5 line-clamp-1 uppercase group-hover:text-emerald-400 transition-colors">{errand.details}</h3>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end shrink-0">
                              <span className="font-mono text-base font-black text-emerald-400">₦{errand.fee}</span>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold mt-0.5">{errand.urgency}</span>
                            </div>
                          </div>

                          {/* Middle Route Markers (Subtle vector connectors) */}
                          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-900 flex items-center justify-between text-xs mb-4">
                            <div className="flex items-center gap-2 max-w-[45%]">
                              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-slate-300 font-sans tracking-tight truncate uppercase text-[10.5px] font-medium">{errand.source}</span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-700 shrink-0 mx-2 animate-pulse" />
                            <div className="flex items-center gap-2 max-w-[45%] justify-end">
                              <span className="text-slate-300 font-sans tracking-tight truncate uppercase text-[10.5px] font-medium">{errand.destination}</span>
                              <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* Lower Status Indicator & Details */}
                        <div className="flex justify-between items-center border-t border-slate-900/60 pt-3.5 text-[10px]">
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-black uppercase border tracking-wider text-[8.5px] ${statusColors[errand.status]}`}>
                            {errand.status}
                          </span>
                          
                          <div className="flex items-center gap-2 text-slate-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                            {errand.runnerName !== "Unassigned" ? (
                              <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg">
                                <User className="h-3 w-3 text-indigo-400" />
                                <span>COURIER: <strong className="text-slate-200 font-bold">{errand.runnerName}</strong></span>
                              </span>
                            ) : (
                              <span className="text-emerald-400 bg-emerald-950/15 border border-emerald-900/50 px-2 py-1 font-black animate-pulse rounded-lg uppercase tracking-wider text-[8.5px]">
                                POOL WAITING GRAB
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredErrands.length === 0 && (
                    <div className="p-12 text-center bg-slate-950/40 border border-slate-850 rounded-2xl relative shadow-md">
                      <AlertCircle className="h-8 w-8 text-slate-650 mx-auto mb-3" />
                      <p className="text-xs text-slate-400 font-sans uppercase tracking-wider font-bold">No active student runs matched search parameters.</p>
                      <p className="text-[10px] text-slate-550 font-mono mt-1">TRY RE-TYPING SEARCH FILTER OR TOGGLE CATEGORIES</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Interactive Workspace Panel (5/12 Columns - SVG map and dispatch actions stacked) */}
            <div className={`col-span-1 lg:col-span-5 space-y-6 ${mobileFeedView === "tracker" ? "block" : "hidden lg:block"}`}>
              
              {/* Active Detailed Errand Card & Simulation controller */}
              <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 relative space-y-5 shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-center border-b border-slate-900/80 pb-3">
                  <div>
                    <span className="text-[8px] font-mono uppercase text-emerald-400 tracking-widest font-extrabold block">LOCK & COMMISSION LEDGER</span>
                    <h2 className="text-xs font-bold text-white uppercase font-sans tracking-wide mt-0.5">CONTRACT MONITOR</h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-200 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg font-bold">
                    {activeErrand.id}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-450 font-bold uppercase tracking-wider text-[8px]">REQUESTER ID:</span>
                    <strong className="text-slate-200 uppercase tracking-tight font-sans">{activeErrand.requesterName}</strong>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 font-sans italic bg-slate-950/60 p-4 rounded-xl border border-slate-900 shadow-inner">
                    &quot;{activeErrand.details}&quot;
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-955/60 p-3 rounded-xl border border-slate-900">
                      <span className="text-[8px] text-slate-450 block font-mono font-bold uppercase tracking-wider">COMPLEXITY</span>
                      <p className="text-slate-300 mt-1 text-[10px] font-mono leading-snug uppercase tracking-tight">{activeErrand.complexity}</p>
                    </div>
                    <div className="bg-slate-955/60 p-3 rounded-xl border border-slate-900">
                      <span className="text-[8px] text-slate-450 block font-mono font-bold uppercase tracking-wider">RISK RATING</span>
                      <p className={`font-mono mt-1 text-[10px] font-bold uppercase tracking-widest ${
                        activeErrand.riskLevel.includes("Critical") || activeErrand.riskLevel.includes("High") 
                          ? "text-rose-400" 
                          : "text-amber-400"
                      }`}>{activeErrand.riskLevel}</p>
                    </div>
                  </div>

                  <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900 space-y-1">
                    <span className="text-[8px] text-slate-455 block font-mono font-bold uppercase tracking-wider">ESCROW SECURE SHIELD NOTES</span>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">{activeErrand.feedback}</p>
                  </div>
                </div>

                {/* SIMULATION STEPPER CONTROLS */}
                <div className="border-t border-slate-900/60 pt-4 space-y-3">
                  <span className="text-[8px] font-mono tracking-widest uppercase text-slate-500 block font-black">
                    ACTIVATE ESCROW HANDSHAKES:
                  </span>

                  {activeErrand.status === ErrandStatus.REQUESTED && (
                    <div className="space-y-3">
                      <div className="bg-amber-950/15 border border-amber-900/40 p-3 rounded-xl text-[10px] text-amber-300 leading-normal font-sans uppercase">
                        ⚠️ <strong>DEPOSIT SECURED:</strong> Escrow contract is locking ₦{activeErrand.fee} safely. Release will only trigger on photo proof.
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStateAdvance(activeErrand.id, ErrandStatus.ACCEPTED)}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-sans font-bold tracking-wider text-[11px] uppercase rounded-xl transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
                        >
                          Lock Contract & Accept Run
                        </button>
                      </div>
                    </div>
                  )}
                      
                  {activeErrand.status === ErrandStatus.ACCEPTED && (
                    <div className="space-y-3">
                      <div className="bg-blue-950/15 border border-blue-900/35 p-3 rounded-xl text-[10px] text-blue-300 leading-normal font-sans uppercase">
                        🔑 <strong>CONTRACT CONFIRMED:</strong> Runner has accepted. Escrow collateral is actively mapped to state.
                      </div>
                      <button
                        onClick={() => handleStateAdvance(activeErrand.id, ErrandStatus.IN_PROGRESS)}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-400 hover:to-indigo-550 text-white font-sans font-bold tracking-wider text-[11px] uppercase rounded-xl transition-all shadow-md shadow-blue-950/20 cursor-pointer"
                      >
                        Signal Transit Start (Item Acquired)
                      </button>
                    </div>
                  )}

                  {activeErrand.status === ErrandStatus.IN_PROGRESS && (
                    <div className="space-y-3">
                      <div className="bg-purple-950/15 border border-purple-900/35 p-3 rounded-xl text-[10px] text-purple-300 leading-normal font-sans uppercase">
                        ⚡ <strong>TRANSIT DISPATCH:</strong> Courier is in active transit to {activeErrand.destination}.
                      </div>
                      <button
                        onClick={() => handleStateAdvance(activeErrand.id, ErrandStatus.COMPLETED)}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-sans font-bold tracking-wider text-[11px] uppercase rounded-xl transition-all shadow-md shadow-purple-950/20 cursor-pointer"
                      >
                        Accept Verification & Release Escrow Pay
                      </button>
                    </div>
                  )}

                  {activeErrand.status === ErrandStatus.COMPLETED && (
                    <div className="space-y-1">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-[10px] text-emerald-400 font-sans font-semibold uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-405 shrink-0" />
                        <span>Transaction fully finalized. Peer pay released.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Miniature SVG Map visualizer stacked directly inside the panel */}
              <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 relative shadow-xl backdrop-blur-md">
                <span className="text-[8px] font-mono uppercase text-emerald-400 font-extrabold flex items-center gap-1.5 tracking-widest">
                  <MapIcon className="h-3 w-3 text-emerald-400 animate-pulse" /> GEOGRAPHICAL COURIER CORE
                </span>
                <p className="text-[9px] text-slate-400 font-sans mt-0.5 uppercase tracking-wide">Live tracking thread: {activeErrand.source} ➔ {activeErrand.destination}</p>
                
                {/* Embedded dynamic vector graphic map */}
                <div className="h-44 bg-slate-950 border border-slate-900 rounded-xl mt-4 relative overflow-hidden flex items-center justify-center shadow-inner">
                  <svg className="w-full h-full text-slate-800 absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid Pattern */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Active Route Path Connection */}
                    {activeErrand.sourceCoords && activeErrand.destCoords && (
                      <g>
                        <line 
                          x1={`${activeErrand.sourceCoords.x}%`} 
                          y1={`${activeErrand.sourceCoords.y}%`}
                          x2={`${activeErrand.destCoords.x}%`} 
                          y2={`${activeErrand.destCoords.y}%`}
                          stroke="#10b981" 
                          strokeWidth="2.5" 
                          strokeDasharray="6,4"
                          className="animate-[dash_10s_linear_infinite]"
                          style={{ strokeDashoffset: -20 }}
                        />
                        {/* Moving runner bubble indicator along path */}
                        <circle r="4" fill="#6366f1" className="animate-ping">
                          <animate 
                            attributeName="cx" 
                            from={`${activeErrand.sourceCoords.x}%`} 
                            to={`${activeErrand.destCoords.x}%`} 
                            dur="4s" 
                            repeatCount="indefinite" 
                          />
                          <animate 
                            attributeName="cy" 
                            from={`${activeErrand.sourceCoords.y}%`} 
                            to={`${activeErrand.destCoords.y}%`} 
                            dur="4s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                        <circle r="3" fill="#6366f1">
                          <animate 
                            attributeName="cx" 
                            from={`${activeErrand.sourceCoords.x}%`} 
                            to={`${activeErrand.destCoords.x}%`} 
                            dur="4s" 
                            repeatCount="indefinite" 
                          />
                          <animate 
                            attributeName="cy" 
                            from={`${activeErrand.sourceCoords.y}%`} 
                            to={`${activeErrand.destCoords.y}%`} 
                            dur="4s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      </g>
                    )}

                    {/* Nodes plotting */}
                    {Object.values(CAMPUS_LOCATIONS).map((node, i) => {
                      const isSource = node.name === activeErrand.source;
                      const isDest = node.name === activeErrand.destination;
                      const isTarget = isSource || isDest;
                      return (
                        <g key={i}>
                          <circle 
                            cx={`${node.x}%`} 
                            cy={`${node.y}%`} 
                            r={isTarget ? "5.5" : "3.5"} 
                            fill={isSource ? "#10b981" : isDest ? "#f43f5e" : "#475569"} 
                            className={isTarget ? "animate-pulse" : ""}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* HTML overlay tags */}
                  {Object.entries(CAMPUS_LOCATIONS).map(([key, node], i) => {
                    const isSource = node.name === activeErrand.source;
                    const isDest = node.name === activeErrand.destination;
                    if (isSource || isDest) {
                      return (
                        <div 
                          key={i} 
                          className="absolute text-[8px] font-mono px-1 py-0.2 rounded font-black border pointer-events-none select-none"
                          style={{ 
                            left: `${node.x}%`, 
                            top: `${node.y - 12}%`,
                            transform: "translateX(-50%)",
                            backgroundColor: isSource ? "rgba(16, 185, 129, 0.95)" : "rgba(244, 63, 94, 0.95)",
                            color: "#fff",
                            borderColor: isSource ? "#047857" : "#be123c"
                          }}
                        >
                          {node.alias} ({isSource ? "PICK" : "DROP"})
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

        {/* SCREEN SECTION 2: CREATE / DISPATCH AN ERRAND */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* The Order Builder Interface (7/12 Columns) */}
            <div className="col-span-1 lg:col-span-8 bg-slate-900/40 border border-slate-805/90 rounded-2xl p-6 space-y-6 relative shadow-xl backdrop-blur-md">
              
              <div>
                <span className="text-[8px] font-mono tracking-widest uppercase text-emerald-400 font-extrabold block">INSTANT ERRAND PLACEMENT</span>
                <h2 className="text-lg font-bold tracking-tight text-white uppercase font-sans mt-0.5">SUBMIT YOUR CAMPUS RUN</h2>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Select intermediate automated parsing of WhatsApp notifications via Gemini AI, or fill our secure manual escrow form.</p>
              </div>

              {/* Order Method Toggle tabs inside refined capsule frame */}
              <div className="bg-slate-950/70 border border-slate-850 p-1 rounded-xl flex gap-1 w-full max-w-sm">
                <button
                  onClick={() => setOrderMethod("whatsapp")}
                  className={`flex-1 py-2 text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-300 cursor-pointer rounded-lg ${
                    orderMethod === "whatsapp" 
                      ? "bg-slate-800 text-emerald-400 shadow-sm" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  📟 WhatsApp AI Ingest
                </button>
                <button
                  onClick={() => setOrderMethod("form")}
                  className={`flex-1 py-2 text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-300 cursor-pointer rounded-lg ${
                    orderMethod === "form" 
                      ? "bg-slate-800 text-emerald-400 shadow-sm" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  📝 Structural Form
                </button>
              </div>

              {/* METHOD A: WhatsApp text block extraction with real Gemini Hook */}
              {orderMethod === "whatsapp" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8.5px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      PASTE COPIED WHATSAPP CHAT MESSAGE BELOW:
                    </label>
                    <textarea
                      rows={5}
                      value={rawWhatsAppMessage}
                      onChange={(e) => setRawWhatsAppMessage(e.target.value)}
                      placeholder="DM COPY PASTE: E.G., WHO IS NEAR CHITIS? PLS BUY 2 WRAPS OF OKPA AND A BOTTLE OF CHILLED FANTA TO BALEWA RM 302..."
                      className="w-full bg-slate-950/60 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 outline-none p-4 rounded-xl text-xs text-slate-200 font-mono leading-relaxed resize-none uppercase transition-all"
                    />
                  </div>

                  {/* Presets Grid */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-mono uppercase text-slate-500 font-extrabold tracking-widest">QUICK PRE-LOADED CAMPUS DEMOS:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-35">
                      {WHATSAPP_PRESETS.map((preset, i) => (
                        <div
                          key={i}
                          onClick={() => setRawWhatsAppMessage(preset.text)}
                          className="bg-slate-950/50 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-3.5 rounded-xl cursor-pointer text-left transition-all duration-300 shadow-md hover:translate-y-[-1px]"
                        >
                          <strong className="text-white text-[10px] font-sans block uppercase tracking-wider">{preset.title}</strong>
                          <p className="text-[9.5px] text-slate-400 line-clamp-1 font-mono mt-1 uppercase">{preset.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {aiError && (
                    <div className="p-3 border border-amber-500/20 bg-amber-950/15 rounded-xl text-[10px] text-amber-400 font-mono flex items-center gap-2 uppercase font-bold">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {aiError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleAICopingMechanism}
                      disabled={isParsingAI || !rawWhatsAppMessage.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-900 disabled:to-slate-950 disabled:text-slate-600 text-white font-sans font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-md shadow-emerald-950/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isParsingAI ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Parsing via Gemini API Route ...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Parse with Gemini AI Dispatch Parser
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleDirectMvpDispatch}
                      disabled={isParsingAI || !rawWhatsAppMessage.trim()}
                      className="py-3 px-5 bg-slate-950/80 hover:bg-slate-900 text-slate-350 font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl border border-slate-850 hover:border-slate-755 transition-all cursor-pointer"
                    >
                      Instant Bypass Dispatch
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD B: Direct Structured Application Form */}
              {orderMethod === "form" && (
                <div className="space-y-4 text-[10px] font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">ERRAND CATEGORY:</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as ErrandCategory)}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-sans uppercase transition-all"
                      >
                        <option value={ErrandCategory.FOOD}>🍔 Meal (Chitis / Franco)</option>
                        <option value={ErrandCategory.PRINTING}>🖨️ Document Pressing (JGI / CEC)</option>
                        <option value={ErrandCategory.WATER}>💧 Borhole Water Haulage</option>
                        <option value={ErrandCategory.GROCERY}>🛒 Market provisions / gate items</option>
                        <option value={ErrandCategory.ACADEMIC}>📚 Science / biochemistry labs</option>
                        <option value={ErrandCategory.CUSTOM}>⚙️ Custom Peer Run</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">PRIORITY / URGENCY:</label>
                      <select
                        value={formUrgency}
                        onChange={(e) => setFormUrgency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-sans uppercase transition-all"
                      >
                        <option value="Flexible (Within 12h)">Flexible (Within 12h)</option>
                        <option value="Urgent (20-30 mins)">Urgent (20-30 mins)</option>
                        <option value="Time-locked class submit">Time-locked class submit</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">PICKUP FROM (SOURCE):</label>
                      <select
                        value={formSource}
                        onChange={(e) => setFormSource(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-sans uppercase transition-all"
                      >
                        {Object.keys(CAMPUS_LOCATIONS).filter(k => CAMPUS_LOCATIONS[k].type === "pickup" || CAMPUS_LOCATIONS[k].type === "station").map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">DELIVER TO (DESTINATION):</label>
                      <select
                        value={formDestination}
                        onChange={(e) => setFormDestination(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-sans uppercase transition-all"
                      >
                        {Object.keys(CAMPUS_LOCATIONS).filter(k => CAMPUS_LOCATIONS[k].type === "dropoff").map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">SECURE CASH PAYOUT COMMITTED (NAIRA):</label>
                    <div className="flex items-center gap-2 max-w-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-1 text-slate-100">
                      <span className="text-base text-slate-400 font-sans font-extrabold">₦</span>
                      <input 
                        type="number" 
                        min="300"
                        step="50"
                        value={formPayout}
                        onChange={(e) => setFormPayout(parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border-0 outline-none p-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">SPECIFIC RUN DETAILS (COCA COLA SPEC, FLAVOR, PRINT SIZE SHIELDS...):</label>
                    <input
                      type="text"
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      placeholder="E.G., 2 WRAPS OF HOT OKPA WITH PLANTAIN AND COLD SPRITE 50CL ..."
                      className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-sans uppercase transition-all"
                    />
                  </div>

                  <button
                    onClick={handleFormCustomDispatch}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-sans font-bold tracking-wider text-[11px] uppercase rounded-xl transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Dispatch Secure Handshake Run to Node
                  </button>
                </div>
              )}

            </div>

            {/* Quick alert feeds & simulator updates (4/12 Columns) */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              
              {/* Vetted Runner Profile info box */}
              <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 relative shadow-xl backdrop-blur-md space-y-4">
                <span className="text-[8.5px] font-mono uppercase text-[#10b981] font-extrabold flex items-center gap-1.5 tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-[#10b981]" /> VETTED FULFILLERS CONSOLE
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                  Peer agents release security locks within active hostel rooms on campus to ensure safe deliveries.
                </p>

                <div className="space-y-3 bg-slate-950/75 p-4 rounded-xl border border-slate-850 mt-1 uppercase">
                  <div>
                    <div className="flex justify-between text-[10px] font-sans font-bold mb-1.5">
                      <span className="text-slate-400">Runner Rating:</span>
                      <strong className="text-amber-400 flex items-center gap-1">★ {runnerRatingInput}</strong>
                    </div>
                    <input 
                      type="range" 
                      min="3.5" 
                      max="5.0" 
                      step="0.1" 
                      value={runnerRatingInput} 
                      onChange={(e) => setRunnerRatingInput(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-sans border-t border-slate-900/60 pt-2.5">
                    <span className="text-slate-400 font-bold">Escrow Deposit:</span>
                    <span className="text-white font-extrabold text-xs">₦2,500</span>
                  </div>
                  <div className="text-[9px] text-slate-505 font-sans tracking-tight leading-snug">
                    *Vouch limits correspond cleanly with the active trust rating limit score values.
                  </div>
                </div>
              </div>

              {/* Group Simulator stream alert box */}
              <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 relative shadow-xl backdrop-blur-md space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <span className="text-[8.5px] font-mono uppercase text-emerald-400 font-extrabold flex items-center gap-1.5 tracking-wider">
                    <MessageSquare className="h-4 w-4 text-emerald-405" /> UNN DISPATCH CHANNEL ALERTS
                  </span>
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin text-[10px] leading-relaxed text-slate-305">
                  {whatsappGroupAlerts.map((log, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl font-sans"
                    >
                      <span className="text-emerald-400 mr-1 font-bold">📢 [DISPATCH ALARM]</span> {log}
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* SCREEN SECTION 3: INTERACTIVE CAMPUS MAP */}
        {activeTab === "map" && (
          <div className="bg-slate-900/40 border border-slate-805/95 rounded-2xl p-5 md:p-6 relative shadow-xl backdrop-blur-sm space-y-5">
            
            <div className="border-b border-slate-900/80 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[8px] font-mono uppercase text-emerald-400 font-extrabold block">NSUKKA CAMPUS GEOGRAPHY</span>
                <h2 className="text-lg font-bold text-white uppercase font-sans tracking-tight mt-0.5">UNN ACTIVE COURIER GRID</h2>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Landmark coordinate hubs and live running delivery pipelines registered on system nodes.</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[9px] font-sans uppercase font-bold text-slate-350">
                <span className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full"></span> PICKUP STALLS
                </span>
                <span className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl">
                  <span className="h-2 w-2 bg-rose-500 rounded-full"></span> DESTINATION HOSTELS
                </span>
              </div>
            </div>

            {/* Huge full visual Map Grid */}
            <div className="h-[460px] bg-slate-950 border border-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
              <svg className="w-full h-full text-slate-800 absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                
                {/* Visual Grid backwash */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Drawn active routes connecting all errands */}
                {errands.map((err, idx) => {
                  if (err.status !== ErrandStatus.COMPLETED) {
                    const isSelected = selectedErrandId === err.id;
                    return (
                      <g key={idx}>
                        <line 
                          x1={`${err.sourceCoords.x}%`} 
                          y1={`${err.sourceCoords.y}%`}
                          x2={`${err.destCoords.x}%`} 
                          y2={`${err.destCoords.y}%`}
                          stroke={isSelected ? "#10b981" : "#52525b"} 
                          strokeWidth={isSelected ? "3" : "1"} 
                          strokeDasharray={isSelected ? "5,3" : "3,3"}
                          opacity={isSelected ? 1.0 : 0.35}
                          className={isSelected ? "animate-[dash_12s_linear_infinite]" : ""}
                        />
                        {isSelected && (
                          <circle r="4.5" fill="#e11d48" className="animate-ping">
                            <animate 
                              attributeName="cx" 
                              from={`${err.sourceCoords.x}%`} 
                              to={`${err.destCoords.x}%`} 
                              dur="4s" 
                              repeatCount="indefinite" 
                            />
                            <animate 
                              attributeName="cy" 
                              from={`${err.sourceCoords.y}%`} 
                              to={`${err.destCoords.y}%`} 
                              dur="4s" 
                              repeatCount="indefinite" 
                            />
                          </circle>
                        )}
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Nodes rendering design */}
                {Object.entries(CAMPUS_LOCATIONS).map(([key, loc], idx) => {
                  const hasActivePickup = errands.some(e => e.source === loc.name && e.status !== ErrandStatus.COMPLETED);
                  const hasActiveDrop = errands.some(e => e.destination === loc.name && e.status !== ErrandStatus.COMPLETED);
                  const isActive = hasActivePickup || hasActiveDrop;

                  return (
                    <g key={idx}>
                      {/* Pulse circle backend */}
                      {isActive && (
                        <circle 
                          cx={`${loc.x}%`} 
                          cy={`${loc.y}%`} 
                          r="12" 
                          fill={loc.type === "pickup" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)"}
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Core circle */}
                      <circle 
                        cx={`${loc.x}%`} 
                        cy={`${loc.y}%`} 
                        r={isActive ? "7" : "5"} 
                        fill={loc.type === "pickup" ? "#10b981" : loc.type === "station" ? "#f59e0b" : "#f43f5e"} 
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

              </svg>

              {/* Dynamic labels floating */}
              {Object.entries(CAMPUS_LOCATIONS).map(([key, loc], idx) => {
                const isSelected = activeErrand.source === loc.name || activeErrand.destination === loc.name;
                return (
                  <div
                    key={idx}
                    className={`absolute text-[8.5px] sm:text-[9px] font-sans px-2 py-0.5 rounded-lg border pointer-events-none select-none transition-all uppercase ${
                      isSelected 
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 scale-105 font-bold shadow-lg" 
                        : "bg-slate-900/95 text-slate-450 border-slate-800/80"
                    }`}
                    style={{ 
                      left: `${loc.x}%`, 
                      top: `${loc.y + 4}%`,
                      transform: "translateX(-50%)"
                    }}
                  >
                    {loc.alias}
                  </div>
                );
              })}

              {/* Float Legend panel bottom corner */}
              <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-800 p-4 rounded-xl flex flex-col gap-1.5 text-[9px] font-sans uppercase tracking-wide shadow-xl backdrop-blur-md">
                <span className="font-bold border-b border-slate-800/80 pb-1.5 text-slate-300 text-[8px] tracking-widest block">MAP METRIC SYMBOLS</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full inline-block"></span> Stall Pickup Nodes
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-rose-500 rounded-full inline-block"></span> Hostel Dorm Locations
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-amber-500 rounded-full inline-block"></span> Borehole Stations
                </div>
              </div>
            </div>

            {/* Quick alert panel explanation */}
            <div className="bg-slate-950/60 border border-slate-900 p-4.5 rounded-2xl text-[11px] text-slate-400 font-sans tracking-normal flex items-start gap-3 shadow-md">
              <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                As errands are inputted through the WhatsApp parsing model or custom forms, their geolocations automatically resolve onto this live active map grid. Pulsing lines trace active, running escrow contracts securely.
              </p>
            </div>

          </div>
        )}

        {/* SCREEN SECTION 4: ESCROW WALLET & SURGE PLAYGROUND */}
        {activeTab === "escrow" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* The Surge Pricing Playground (7/12 Columns) */}
            <div className="col-span-1 lg:col-span-7 bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6 relative">
              
              <div>
                <span className="text-[8px] font-mono uppercase text-emerald-400 font-extrabold block">DYNAMIC FEES GRID</span>
                <h2 className="text-lg font-bold tracking-tight text-white uppercase font-sans mt-0.5">SURCHARGE MATRIX OPTIMIZER</h2>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Simulate campus barriers like late night curfew, unpaved rain muddy slashes, or acute borehole water haulage.</p>
              </div>

              <div className="space-y-4">
                
                {/* Base Run input */}
                <div className="space-y-1.5 font-sans text-xs max-w-xs uppercase">
                  <label className="text-slate-400 font-bold block text-[9.5px] tracking-wide">BASE RUN FEE STANDARD (₦):</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1">
                    <span className="text-base text-slate-400 font-sans font-extrabold">₦</span>
                    <input
                      type="number"
                      value={baseRunFee}
                      onChange={(e) => setBaseRunFee(parseInt(e.target.value) || 0)}
                      step="50"
                      min="300"
                      className="w-full bg-transparent border-0 outline-none p-2 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Surcharges Checklist */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Select active campus surcharges:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs uppercase">
                    
                    <label className="flex items-center gap-3 bg-slate-950/70 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-4 rounded-xl cursor-pointer transition-all duration-300">
                      <input 
                        type="checkbox" 
                        checked={surgeLateNight} 
                        onChange={(e) => setSurgeLateNight(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white block text-xs">Late Night Session (+30%)</strong>
                        <span className="text-[9px] text-slate-400 block leading-tight mt-0.5 font-sans normal-case">After 10:00 PM hostel gate closures.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-950/70 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-4 rounded-xl cursor-pointer transition-all duration-300">
                      <input 
                        type="checkbox" 
                        checked={surgeHeavyRain} 
                        onChange={(e) => setSurgeHeavyRain(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white block text-xs font-bold">Inclement Rain (+40%)</strong>
                        <span className="text-[9px] text-slate-400 block leading-tight mt-0.5 font-sans normal-case">Unpaved Nsukka muddy walk conditions.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-950/70 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-4 rounded-xl cursor-pointer transition-all duration-300">
                      <input 
                        type="checkbox" 
                        checked={surgeExamWeek} 
                        onChange={(e) => setSurgeExamWeek(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white block text-xs font-bold">Exam Session Week (+20%)</strong>
                        <span className="text-[9px] text-slate-400 block leading-tight mt-0.5 font-sans normal-case">Highest daily student urgency lock.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-950/70 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-4 rounded-xl cursor-pointer transition-all duration-300">
                      <input 
                        type="checkbox" 
                        checked={surgeWaterCrisis} 
                        onChange={(e) => setSurgeWaterCrisis(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white block text-xs font-bold">Water Outfit Crisis (+50%)</strong>
                        <span className="text-[9px] text-slate-400 block leading-tight mt-0.5 font-sans normal-case">Requires heavy staircase haulage.</span>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Surcharge breakdown outcome */}
                <div className="bg-slate-950/70 border border-slate-900 p-4 rounded-xl mt-4 space-y-3 text-xs uppercase">
                  <h4 className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">REVENUE DISTRIBUTION LEDGER FRAME:</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-900/35 p-3 rounded-xl border border-slate-850">
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">TOTAL COMMITTED ESCROW</span>
                      <strong className="text-white font-mono text-sm block mt-1">₦{totalCalculatedFee}</strong>
                    </div>
                    <div className="bg-slate-900/35 p-3 rounded-xl border border-slate-850">
                      <span className="text-[8px] text-emerald-400 block uppercase font-bold">RUNNER DISBURSEMENT (85%)</span>
                      <strong className="text-emerald-300 font-mono text-sm block mt-1">₦{runnerEarnings}</strong>
                    </div>
                    <div className="bg-slate-900/35 p-3 rounded-xl border border-slate-850 col-span-2 md:col-span-1">
                      <span className="text-[8px] text-teal-400 block uppercase font-bold">SYSTEM COMMISSION (15%)</span>
                      <strong className="text-teal-300 font-mono text-sm block mt-1">₦{companyComissions}</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Batch Consolidation Simulator and Escrow safe indicators (5/12 Columns) */}
            <div className="col-span-1 lg:col-span-5 space-y-6">
              
              {/* Consolidation routes batch calculator */}
              <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-4">
                <div>
                  <span className="text-[8px] font-mono uppercase text-emerald-400 font-extrabold block">PROXIMITY ALGORITHMS</span>
                  <h3 className="text-xs font-bold text-white uppercase font-sans tracking-wide mt-0.5">ROUTE BATCHING OPTIMIZER</h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-1">Simulated automatic bundle processing of co-located orders saving individual payouts by up to 30%!</p>
                </div>

                <div className="space-y-4 bg-slate-950/70 border border-slate-900 p-4 rounded-xl uppercase">
                  {/* Co-located orders count input bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-slate-400 font-bold">Co-located meals on route:</span>
                      <strong className="text-emerald-400 text-xs">{simulatedOkpaRequestsCount} orders</strong>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={simulatedOkpaRequestsCount} 
                      onChange={(e) => setSimulatedOkpaRequestsCount(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer mt-1"
                    />
                  </div>

                  {/* Calculations breakdown block */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-900/60 pt-2.5">
                    <div>
                      <span className="text-slate-450 block font-bold text-slate-400">UNBATCHED BASELINE:</span>
                      <span className="block text-slate-350 font-mono">₦{individualRunFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 block font-bold text-slate-400">BATCHED POOL (-30%):</span>
                      <span className="block text-emerald-400 font-mono font-bold">₦{batchedRunFee} / ITEM</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl text-[10px] font-sans normal-case text-slate-300">
                    ⚡ <strong>Consolidated Runner yield:</strong> Safe release triggers payout of <strong className="text-emerald-400 font-mono font-bold text-xs">₦{batchedRunnerEarning}</strong> in a single transaction path! Requesters save 30% dynamically.
                  </div>
                </div>
              </div>

              {/* Digital Escrow Flow Safeguard info card */}
              <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-3">
                <span className="text-[8.5px] font-mono uppercase text-emerald-400 font-extrabold flex items-center gap-1.5 tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> HANDSHAKE FLOW SECURITIES
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans mt-1">
                  1. Requester locks total payout in escrow contract.<br />
                  2. Dispatch bot approves matching runner.<br />
                  3. Runner purchases items with secure tracking.<br />
                  4. Photo handover verification triggers payouts!
                </p>
              </div>

            </div>

          </div>
        )}

        {/* SCREEN SECTION: AI COPILOT WORKSPACE DESK */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Interactive Chat Console (7/12 Columns) */}
            <div className="col-span-1 lg:col-span-7 bg-slate-900/40 border border-slate-805/90 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col gap-4 relative">
              
              <div className="flex items-center justify-between border-b border-slate-900/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-950 border border-slate-850 flex items-center justify-center text-lg relative rounded-xl shadow-inner">
                    🦁
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border border-slate-950 rounded-full animate-pulse"></span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans uppercase tracking-wide">
                      ADAUGO DISPATCH AI
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20">VETTED LOGISTICS CO-PILOT</span>
                    </h2>
                    <p className="text-[9.5px] text-slate-400 font-sans tracking-wide">UNN Logistics Optimizer Expert Agent (Gemini Internal)</p>
                  </div>
                </div>

                <button 
                  onClick={() => setChatMessages([
                    {
                      role: "model",
                      content: "Hi there! I am **Adaugo**, your AI Dispatch Copilot for Runs UNN. 🦁\n\nI can help you price your running errands, generate highly optimized WhatsApp group-alert posts, advise on route consolidation, or explain student escrow protection on our campus.\n\nWhat campus run can I help you plan or optimize today?"
                    }
                  ])}
                  className="px-3 py-1.5 text-[9px] font-sans text-slate-400 uppercase tracking-widest hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Clear Thread
                </button>
              </div>

              {/* Chat Thread Area */}
              <div className="h-[400px] overflow-y-auto bg-slate-950 p-4 border border-slate-900/80 space-y-4 scrollbar-none rounded-2xl">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-slate-505 font-sans mb-1 uppercase tracking-tight">
                      {msg.role === "user" ? (
                        <>
                          <span>Student Request</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 text-emerald-400 mr-0.5 animate-pulse" />
                          <span className="text-emerald-400 font-bold">Adaugo System Oracle</span>
                        </>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-2xl max-w-[85%] text-xs shadow-md leading-relaxed font-sans border ${
                      msg.role === "user" 
                        ? "bg-slate-900 text-slate-100 border-slate-850 text-left" 
                        : "bg-slate-900/30 border border-slate-900/70 text-slate-250 text-left"
                    }`}>
                      {renderFormattedText(msg.content)}
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex flex-col items-start border-l-2 border-emerald-500 pl-3">
                    <div className="flex items-center gap-1 text-[9px] text-[#8c8c8e] font-sans mb-1 uppercase">
                      <RefreshCw className="h-3 w-3 text-emerald-400 animate-spin mr-0.5" />
                      <span>Adaugo evaluating Nsukka route conditions...</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-slate-400 text-[10px] italic font-sans uppercase">
                      Deducing route surcharges, live weather hazards, and escrow indexes...
                    </div>
                  </div>
                )}
              </div>

              {/* Action Suggested Queries */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-sans font-black text-slate-400 uppercase tracking-widest block">SUGGESTED OPTIMIZATIONS:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: "₦ Payout guidelines for Water", text: "How much should I charge or pay for fetching 4 jerrycans of borehole water to Slessor Hall 3rd floor?" },
                    { label: "📲 WhatsApp Group Template", text: "Give me a high-engagement WhatsApp group-alert template for an urgent Biochemistry manual collection run from JGI to Bello hostel." },
                    { label: "📦 Consolidated Bulk Runs", text: "Tell me more about bulk/batch route consolidations & how my friends can split fees from Chitis to Balewa." },
                    { label: "🛡️ Escrow safety handshake", text: "Explain how this application's peer escrow contract works for students. Is my coin safe?" }
                  ].map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => handleSendChatMessage(btn.text)}
                      disabled={isChatLoading}
                      className="text-[9.5px] font-sans bg-slate-950 hover:bg-slate-900/50 text-slate-300 border border-slate-900 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer uppercase tracking-tight block hover:border-emerald-500/80"
                    >
                      💡 {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2 bg-slate-950 border border-slate-900 p-2 rounded-xl focus-within:border-emerald-500/80 transition-all duration-300"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="ASK ADAUGO ABOUT UNN TRANSIT RATES, HOSTELS, OR TEMPLATES..."
                  disabled={isChatLoading}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none pl-2 py-2 font-sans uppercase"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="h-10 w-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-900 disabled:text-slate-505 rounded-xl flex items-center justify-center text-slate-950 transition-all cursor-pointer border-0 font-bold"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

            </div>

            {/* AI Power Tools Sidebar Toolkit (5/12 Columns) */}
            <div className="col-span-1 lg:col-span-5 space-y-6">
              
              {/* Tool 1: WhatsApp Broadcast Post Optimizer */}
              <div className="bg-[#0b0b0c] border border-zinc-800 rounded-none p-5 shadow-sm space-y-4 relative">
                <div className="absolute top-0 right-0 w-2.5 h-[2px] bg-red-600" />
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#008751] font-extrabold flex items-center gap-1.5 tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-[#008751]" /> BROADCAST FORMATTER
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase font-display mt-1.5">AI WHATSAPP ALERT OPTIMIZER</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide mt-1">Convert raw descriptions into structured messages tailored with escrow safety tags.</p>
                </div>

                <div className="space-y-3 font-mono text-xs uppercase">
                  <div>
                    <label className="text-zinc-500 font-bold block text-[9px] tracking-widest mb-1.5">RAW ERRAND STATEMENT:</label>
                    <textarea
                      value={enhancerRawInput}
                      onChange={(e) => setEnhancerRawInput(e.target.value)}
                      placeholder="E.G. PRINT BIO FILE AT JGI BUILDING BRING TO SLESSOR HALL ROOM 22 FOR 600 NAIRA FAST"
                      rows={2}
                      className="w-full bg-black border border-zinc-855 focus:border-[#008751] outline-hidden p-3 rounded-none text-xs text-zinc-200 leading-normal resize-none uppercase"
                    />
                  </div>

                  <button
                    onClick={handleEnhanceWhatsAppPost}
                    disabled={isEnhancingAI || !enhancerRawInput.trim()}
                    className="w-full bg-[#008751] hover:bg-emerald-600 disabled:bg-zinc-900 disabled:text-zinc-600 py-2.5 rounded-none font-display font-semibold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer text-white"
                  >
                    {isEnhancingAI ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enhancing Post...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Optimize Errand Post
                      </>
                    )}
                  </button>

                  {enhancerEnhancedOutput && (
                    <div className="space-y-2 border-t border-zinc-900 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Optimized Output Draft:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(enhancerEnhancedOutput);
                          }}
                          className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 px-2 py-1 transition-all cursor-pointer border border-emerald-905 rounded-none uppercase"
                        >
                          📋 Copy to Clipboard
                        </button>
                      </div>
                      
                      <div className="bg-black p-3 rounded-none border border-zinc-855 max-h-[160px] overflow-y-auto leading-relaxed text-zinc-300 scrollbar-none whitespace-pre-wrap select-all text-[11px] normal-case">
                        {enhancerEnhancedOutput}
                      </div>

                      <div className="text-[8px] text-zinc-500 font-mono mt-1 uppercase tracking-tight leading-snug">
                        *Generated by Gemini with structural location tags and escrow guarantee parameters.
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Tool 2: AI Pricing Guard & Security Vouch Specs */}
              <div className="bg-[#0b0b0c] border border-zinc-800 rounded-none p-5 shadow-sm space-y-4 relative">
                <div className="absolute top-0 right-0 w-2.5 h-[2px] bg-red-600" />
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#008751] font-extrabold flex items-center gap-1.5 tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5" /> CAMPUS SECURITY SAFEGUARDS
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase font-display mt-1.5">RATE ASSURANCE MATRICES</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide mt-1">AI-indexed standard fair compensation guide across common UNN transit routes.</p>
                </div>

                <div className="space-y-3 font-mono text-[9px] text-[#8c8c8e]">
                  <div className="bg-black border border-zinc-900 p-3 rounded-none flex justify-between items-center uppercase">
                    <div>
                      <span className="text-zinc-400 block font-bold">🍔 Franco & Chitis &rarr; Halls</span>
                      <span className="text-[8px] text-zinc-600">Standard delivery. Time critical.</span>
                    </div>
                    <strong className="text-emerald-400 font-bold">₦500 - ₦650</strong>
                  </div>

                  <div className="bg-black border border-zinc-900 p-3 rounded-none flex justify-between items-center uppercase">
                    <div>
                      <span className="text-zinc-400 block font-bold">🖨️ CEC / JGI &rarr; Hostel Rooms</span>
                      <span className="text-[8px] text-zinc-600">Documents / Books. Active revision blocks.</span>
                    </div>
                    <strong className="text-emerald-400 font-bold">₦600 - ₦800</strong>
                  </div>

                  <div className="bg-black border border-zinc-900 p-3 rounded-none flex justify-between items-center uppercase">
                    <div>
                      <span className="text-zinc-400 block font-bold">🚰 Borehole Station &rarr; High Dorm Floors</span>
                      <span className="text-[8px] text-zinc-600">Water Handing (Staircase haulage).</span>
                    </div>
                    <strong className="text-emerald-400 font-bold text-right">₦1,000 - ₦1,500<br /><span className="text-[7.5px] text-amber-500 uppercase">+ outage surge</span></strong>
                  </div>
                </div>

                <div className="bg-black border border-zinc-900 p-3.5 rounded-none text-[9.5px] text-zinc-500 leading-relaxed font-mono uppercase">
                  📢 <strong>Campus Security Matrix:</strong> Always utilize escrow. Avoid direct student banking paths to keep safety guarantees intact.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SCREEN SECTION 5: PITCH SPECIFICATIONS & STRATEGY PLAYBOOK */}
        {activeTab === "playbook" && (
          <div className="bg-slate-900/40 border border-slate-805/90 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl relative backdrop-blur-md animate-fadeIn">
            
            <div className="border-b border-rose-950/20 pb-5">
              <span className="text-[8px] font-mono tracking-widest text-emerald-400 uppercase font-bold block">VENTURE MANIFESTO & SPECIFICATIONS</span>
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-sans mt-2">NSUKKA CAMPUS STRATEGY PLAYBOOK</h2>
              <p className="text-[10px] text-slate-400 font-sans mt-1">Economic capture of high-density campus microservice networks via low-friction peer handshakes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-sans">1. CORE CAMPUS PAIN INDEX</h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-950/70 border border-slate-900/60 p-5 rounded-xl uppercase">
                    <strong className="text-emerald-400 block text-xs font-sans font-extrabold tracking-wide">Extreme Time Poverty Lock</strong>
                    <p className="text-slate-400 text-[10px] mt-2 leading-relaxed font-sans normal-case">
                      Nsukka students face aggressive coursework. outsourcing tedious queue delays at JGI document desks or Franco food stands buys back precious exam prep slots.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-900/60 p-5 rounded-xl uppercase">
                    <strong className="text-slate-300 block text-xs font-sans font-extrabold tracking-wide">Low-Trust Dorm Environments</strong>
                    <p className="text-slate-400 text-[10px] mt-2 leading-relaxed font-sans normal-case">
                      High resident density fosters security risks. Students refuse upfront deposits to strangers. Runs decouples risk via a dynamic escrow holding vault until photo handovers verify completion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-sans">2. LEAN COURIER CONCIERGE ROADMAP</h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-950/70 border border-slate-900/60 p-5 rounded-xl uppercase">
                    <strong className="text-amber-500 block text-[10px] font-mono uppercase tracking-widest font-bold">Manual-Concierge Intake Loop (Scale-Ready)</strong>
                    <p className="text-slate-400 text-[10px] mt-2 leading-relaxed font-sans normal-case">
                      Instead of early, expensive real-time mapping API bills, Runs captures user intent from WhatsApp group DMs, utilizes Gemini LLM route extraction, and transmits sanitized alert metrics to vetted runner hostel coordinates.
                    </p>
                    <ul className="list-disc pl-4 text-[9px] text-emerald-400 space-y-1 mt-3 font-sans font-bold tracking-tight uppercase">
                      <li>INTERFACE: RESPONSIVE SWISS SYSTEMS LAUNCHER</li>
                      <li>INTAKE: WHATSAPP STREAM EXTRACTION NODE</li>
                      <li>ESCROW: TRUST-RATINGS VOUCH HOSTEL SYSTEM</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-900 pt-6 space-y-5 uppercase">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-sans text-center">3. PERSISTENT ENTITIES MODEL SCHEMAS</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1">
                  <span className="text-emerald-400 font-bold block mb-1">interface ErrandDetails</span>
                  <p className="text-slate-600">{"// Maps run states"}</p>
                  <p>id: string;</p>
                  <p>category: ErrandCategory;</p>
                  <p>details: string;</p>
                  <p>sourceLocation: string;</p>
                  <p>destination: string;</p>
                  <p>payoutFee: number;</p>
                  <p>status: ErrandStatus;</p>
                  <p>activeRunnerID: string | null;</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1">
                  <span className="text-slate-350 font-bold block mb-1">interface StudentRunner</span>
                  <p className="text-slate-600">{"// Vetted Peer Agents"}</p>
                  <p>id: string;</p>
                  <p>fullName: string;</p>
                  <p>vouchReferralRoom: string;</p>
                  <p>escrowSafetyBalance: number;</p>
                  <p>starRating: number; <span className="text-slate-600">{"// 1.0 to 5.0"}</span></p>
                  <p>completedJobs: number;</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1">
                  <span className="text-emerald-500 font-bold block mb-1">interface EscrowLedger</span>
                  <p className="text-slate-600">{"// Transaction Logs"}</p>
                  <p>jobIDReference: string;</p>
                  <p>isCommissionCredited: boolean;</p>
                  <p>isRunnerShareReleased: boolean;</p>
                  <p>isDepositKeyActive: boolean;</p>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="bg-slate-950/45 border-t border-slate-900 text-[10px] text-slate-400 font-sans uppercase tracking-widest py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-center sm:text-left text-slate-400 leading-normal">&copy; 2026 Runs Network. Engineered for high-density campus micro-economies.</span>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM COMMITTED CORE
            </span>
            <span className="text-slate-800 font-black">|</span>
            <span className="text-slate-500">V0.10-RELEASE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

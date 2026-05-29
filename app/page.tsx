"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  ArrowRight, 
  User, 
  CheckCircle, 
  Clock3, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Send, 
  MapPin, 
  RefreshCw, 
  Smartphone, 
  PhoneCall, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  Award, 
  BookOpen, 
  Share2, 
  HelpCircle, 
  Layers, 
  Terminal, 
  Check, 
  DollarSign as NairaIcon 
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

// Fixed campus coordinates corresponding to UNN landmarks
const CAMPUS_LOCATIONS: Record<string, CampusLocation> = {
  "Chitis Fast Food": { name: "Chitis Fast Food", alias: "Chitis", x: 15, y: 35, type: "pickup", color: "bg-emerald-500" },
  "Franco Stalls": { name: "Franco Stalls", alias: "Franco", x: 25, y: 20, type: "pickup", color: "bg-emerald-500" },
  "JGI Building (Printing Press)": { name: "JGI Building (Printing Press)", alias: "JGI Press", x: 50, y: 15, type: "pickup", color: "bg-blue-500" },
  "Sub-station Borehole": { name: "Sub-station Borehole", alias: "Borehole", x: 80, y: 35, type: "pickup", color: "bg-amber-500" },
  "Margret Ekpo Market": { name: "Margret Ekpo Market", alias: "Market", x: 10, y: 65, type: "pickup", color: "bg-teal-500" },
  "CEC Administrative Building": { name: "CEC Administrative Building", alias: "CEC Block", x: 45, y: 40, type: "pickup", color: "bg-indigo-500" },
  "Campus Gate": { name: "Campus Gate", alias: "Main Gate", x: 90, y: 15, type: "pickup", color: "bg-purple-500" },
  
  "Balewa Hall (Male)": { name: "Balewa Hall (Male)", alias: "Balewa", x: 30, y: 85, type: "dropoff", color: "bg-rose-500" },
  "Mary Slessor Hall (Female)": { name: "Mary Slessor Hall (Female)", alias: "Slessor", x: 70, y: 82, type: "dropoff", color: "bg-rose-500" },
  "Eni Njoku Hall (Male)": { name: "Eni Njoku Hall (Male)", alias: "Eni Njoku", x: 15, y: 85, type: "dropoff", color: "bg-rose-500" },
  "Kwame Nkrumah Hall (Postgrad/Female)": { name: "Kwame Nkrumah Hall (Postgrad/Female)", alias: "Nkrumah", x: 85, y: 85, type: "dropoff", color: "bg-rose-500" },
  "Bello Hall (Male)": { name: "Bello Hall (Male)", alias: "Bello", x: 50, y: 80, type: "dropoff", color: "bg-rose-500" },
  "Alvan Ikoku Hall (Female)": { name: "Alvan Ikoku Hall (Female)", alias: "Alvan", x: 55, y: 65, type: "dropoff", color: "bg-rose-500" },
  "Mariere Hall": { name: "Mariere Hall", alias: "Mariere", x: 40, y: 70, type: "dropoff", color: "bg-rose-500" }
};

// Preset sample WhatsApp alerts that students send to group chats
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

// Pure stateless helper functions to satisfy React's functional purity rules
const simulateRandomId = (): string => {
  return `RUN-${Math.floor(1000 + Math.random() * 9000)}`;
};

const simulateRandomRequester = (): string => {
  return "Student Request " + Math.floor(10 + Math.random() * 89);
};

export default function RunsMVP() {
  // Navigation Tabs for Strategy SPEC Viewer
  const [activeTab, setActiveTab] = useState<string>("specs");

  // State for interactive Monetization surge calculator
  const [baseRunFee, setBaseRunFee] = useState<number>(500);
  const [surgeLateNight, setSurgeLateNight] = useState<boolean>(false);
  const [surgeHeavyRain, setSurgeHeavyRain] = useState<boolean>(false);
  const [surgeExamWeek, setSurgeExamWeek] = useState<boolean>(false);
  const [surgeWaterCrisis, setSurgeWaterCrisis] = useState<boolean>(false);
  const [isPrioritySurcharge, setIsPrioritySurcharge] = useState<boolean>(false);

  // Calculated economics parameters derived from current states
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
  const companyComissions = Math.round(totalCalculatedFee * 0.15); // 15% flat Runs commission
  const runnerEarnings = totalCalculatedFee - companyComissions;

  // State for Proximity and Batching optimization simulator
  const [simulatedOkpaRequestsCount, setSimulatedOkpaRequestsCount] = useState<number>(3);
  const [averageHostelDistance, setAverageHostelDistance] = useState<number>(1.2); // in km
  
  // Simulated stats based on batching formula
  const individualRunFee = 600;
  const batchedRunFee = Math.round(individualRunFee * 0.70); // 30% discount for users in batching
  const batchedRunnerEarning = Math.round((batchedRunFee * simulatedOkpaRequestsCount) * 0.85); // 85% of total accumulated batched runs

  // State for the interactive trust level adjuster
  const [runnerRatingInput, setRunnerRatingInput] = useState<number>(4.8);

  // Active Simulated Errands board
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
    }
  ]);

  // Selected Active Errand in sandbox for the "Runner Handset Simulator"
  const [selectedSandboxErrandId, setSelectedSandboxErrandId] = useState<string>("RUN-1003");

  // WhatsApp manual intake console inputs
  const [rawWhatsAppMessage, setRawWhatsAppMessage] = useState<string>(WHATSAPP_PRESETS[0].text);
  const [isParsingAI, setIsParsingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Escrow financial registers
  const [runsAccumulatedCommissions, setRunsAccumulatedCommissions] = useState<number>(450);
  const [totalDisbursedToRunners, setTotalDisbursedToRunners] = useState<number>(2300);

  // Simulated WhatsApp Alerts Feed (showing what the bot outputs to campus group chats)
  const [whatsappGroupAlerts, setWhatsappGroupAlerts] = useState<string[]>([
    "🔔 [NEW RUN ALERT] RUN-1002: Food Delivery from Chitis to Balewa Hall. Fee: ₦650. Vouch Status: Approved. DM Runs Bot to secure.",
    "📱 [LOCKED ALERT] Runner @Kenechukwu locked RUN-1002. Escrow safe-deposit active.",
    "✅ [PAID DONE] RUN-1002 completed! @Kenechukwu dispatched payouts. Runs fee (₦97.5) credited."
  ]);

  // Current system local clock
  const [currentTime, setCurrentTime] = useState<string>("15:33");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch / Post API request to parse Whatsapp input
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
        throw new Error("API call failed");
      }
      const data = await res.json();
      
      const newErrandId = simulateRandomId();
      
      // Attempt coordinates mapping for the visual campus map
      const matchedSource = CAMPUS_LOCATIONS[data.sourceLocation] || CAMPUS_LOCATIONS["Chitis Fast Food"];
      const matchedDest = CAMPUS_LOCATIONS[data.destinationLocation] || CAMPUS_LOCATIONS["Balewa Hall (Male)"];

      let category = ErrandCategory.CUSTOM;
      if (data.errandType === "Food Delivery") category = ErrandCategory.FOOD;
      else if (data.errandType === "Printing & Binding") category = ErrandCategory.PRINTING;
      else if (data.errandType === "Water Hauling") category = ErrandCategory.WATER;
      else if (data.errandType === "Grocery / Market Run") category = ErrandCategory.GROCERY;
      else if (data.errandType === "Academic Submission") category = ErrandCategory.ACADEMIC;

      const preparedErrand: Errand = {
        id: newErrandId,
        category: category,
        details: data.details,
        source: data.sourceLocation,
        destination: data.destinationLocation,
        fee: data.payoutFee,
        surgeMultiplier: 1.0,
        isPriority: false,
        urgency: data.urgencyText,
        status: ErrandStatus.REQUESTED,
        requesterName: simulateRandomRequester(),
        runnerName: "Unassigned",
        runnerRating: 0.0,
        complexity: data.complexityRating,
        riskLevel: data.riskLevel,
        feedback: data.strategyCommentary,
        timestamp: currentTime + " UTC",
        sourceCoords: { x: matchedSource.x, y: matchedSource.y },
        destCoords: { x: matchedDest.x, y: matchedDest.y }
      };

      setErrands(prev => [preparedErrand, ...prev]);
      setSelectedSandboxErrandId(newErrandId);

      // Log push notification alert to whatsapp simulation
      const alertLine = `🔔 [NEW RUN ALERT] ${newErrandId}: ${data.errandType} from ${data.sourceLocation} to ${data.destinationLocation} | Fee Offered: ₦${data.payoutFee}. [Risk Rating: ${data.riskLevel}]`;
      setWhatsappGroupAlerts(prev => [alertLine, ...prev]);

    } catch (err: any) {
      console.error(err);
      setAiError("Fallback active: The server utilized optimized local heuristics parsing instead.");
      
      // Immediate local parser integration inside client if API fails
      const localResult = fallbackHeuristicsParse(rawWhatsAppMessage);
      setErrands(prev => [localResult, ...prev]);
      setSelectedSandboxErrandId(localResult.id);
      
      const alertLine = `🔔 [HEURISTIC NEW RUN] ${localResult.id}: ${localResult.category} run to ${localResult.destination} | ₦${localResult.fee}.`;
      setWhatsappGroupAlerts(prev => [alertLine, ...prev]);
    } finally {
      setIsParsingAI(false);
    }
  };

  // Direct fast dispatch without hitting Gemini model (extremely helpful for speed/testing)
  const handleDirectMvpDispatch = () => {
    const rawHeuristic = fallbackHeuristicsParse(rawWhatsAppMessage);
    setErrands(prev => [rawHeuristic, ...prev]);
    setSelectedSandboxErrandId(rawHeuristic.id);
    const alertLine = `🔔 [FAST DISPATCH] ${rawHeuristic.id}: ${rawHeuristic.category} run to ${rawHeuristic.destination} | Fee: ₦${rawHeuristic.fee}`;
    setWhatsappGroupAlerts(prev => [alertLine, ...prev]);
  };

  // Internal client parser that runs in emergency/offline
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

    let parsedFee = 600;
    const priceMatch = text.match(/(?:₦|ngn|#|pay|for)\s*(\d+)/i) || text.match(/(\d+)\s*(?:naira|ngn|#)/i);
    if (priceMatch && priceMatch[1]) {
      parsedFee = parseInt(priceMatch[1]);
    }

    const sCoords = CAMPUS_LOCATIONS[source] || CAMPUS_LOCATIONS["Franco Stalls"];
    const dCoords = CAMPUS_LOCATIONS[destination] || CAMPUS_LOCATIONS["Balewa Hall (Male)"];

    return {
      id: newId,
      category,
      details: text.substring(0, 100) + "...",
      source,
      destination,
      fee: parsedFee,
      surgeMultiplier: 1.0,
      isPriority: false,
      urgency: normalized.includes("fast") || normalized.includes("now") ? "Urgent" : "Standard",
      status: ErrandStatus.REQUESTED,
      requesterName: "WhatsApp Guest",
      runnerName: "Unassigned",
      runnerRating: 0,
      complexity: "Extracted via instant client-side heuristic parser.",
      riskLevel: "Standard",
      feedback: "MVP Direct dispatch bypassed AI models for instant routing.",
      timestamp: currentTime + " UTC",
      sourceCoords: { x: sCoords.x, y: sCoords.y },
      destCoords: { x: dCoords.x, y: dCoords.y }
    };
  };

  // Sandbox active actions controlling runner simulation state
  const handleStateAdvance = (errandId: string, nextStatus: ErrandStatus) => {
    setErrands(prev => prev.map(item => {
      if (item.id === errandId) {
        let updatedDetails = { ...item, status: nextStatus };
        if (nextStatus === ErrandStatus.ACCEPTED) {
          updatedDetails.runnerName = "Emeka UNN (Vetted)";
          updatedDetails.runnerRating = runnerRatingInput;
          
          // Log to simulated WhatsApp alerts feed
          const matchedAlert = `📱 [LOCKED DISPATCH] @Emeka UNN accepted run ${errandId}. Target pickup: ${updatedDetails.source}. Payout: ₦${updatedDetails.fee}`;
          setWhatsappGroupAlerts(prevFeed => [matchedAlert, ...prevFeed]);
        } else if (nextStatus === ErrandStatus.IN_PROGRESS) {
          const checkInAlert = `📍 [CHECK IN] Runner @Emeka arrived at ${updatedDetails.source}. Purchasing items. Safe escrow verified.`;
          setWhatsappGroupAlerts(prevFeed => [checkInAlert, ...prevFeed]);
        } else if (nextStatus === ErrandStatus.COMPLETED) {
          const currentCommission = Math.round(updatedDetails.fee * 0.15);
          const currentRunnerShare = updatedDetails.fee - currentCommission;
          
          setRunsAccumulatedCommissions(c => c + currentCommission);
          setTotalDisbursedToRunners(r => r + currentRunnerShare);

          const deliveryAlert = `✅ [SUCCESS PAID] ${errandId} delivered to ${updatedDetails.destination}! Runner payout ₦${currentRunnerShare} disbursed. Runs fee (₦${currentCommission}) collected.`;
          setWhatsappGroupAlerts(prevFeed => [deliveryAlert, ...prevFeed]);
        }
        return updatedDetails;
      }
      return item;
    }));
  };

  // Find the currently selected sandbox errand for displaying inside handset console
  const activeSandboxErrand = errands.find(e => e.id === selectedSandboxErrandId) || errands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased Selection:bg-[#008751]/10">
      
      {/* Visual Header Grid - Structural Honesty, No Telemetry Larping */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#008751] flex items-center justify-center text-white font-mono font-bold tracking-tighter text-lg">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="runs-app-title" className="font-mono text-xl font-bold tracking-tight text-slate-900">RUNS</h1>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase px-1.5 py-0.5 rounded font-mono font-semibold tracking-wide flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#008751] animate-pulse"></span>
                  UNN Node
                </span>
              </div>
              <p className="text-xs text-slate-500">Peer-to-Peer Campus Delivery Platform Blueprint</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-emerald-700" />
              <span>Campus UTC: <strong>{currentTime}</strong></span>
            </span>
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3 py-1 rounded-full text-xs">
              <span className="text-slate-600">Admin Concierge: <strong>Online</strong></span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Structural Container - 2-Column Responsive Layout (Workspace Architecture) */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Deep strategic documentation with interactive, reactive simulation metrics (Cols: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section Switcher Tabs */}
          <div className="bg-slate-200 p-1 rounded-lg flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-md transition-all ${
                activeTab === "specs"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. Core Strategy
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-md transition-all ${
                activeTab === "architecture"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2. Data Schema & Flows
            </button>
            <button
              onClick={() => setActiveTab("matching")}
              className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-md transition-all ${
                activeTab === "matching"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3. Matching & Trust
            </button>
            <button
              onClick={() => setActiveTab("economics")}
              className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-md transition-all ${
                activeTab === "economics"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              4. Finance & Expansion
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex-1">
            
            {/* 1. CORE USE CASES & LIFECYCLE */}
            <AnimatePresence mode="wait">
              {activeTab === "specs" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-[#008751]" />
                      Core Use Cases & Lean Product Mechanics
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Nigerian university campuses represent specialized high-density, low-trust micro-economies populated by extreme cash-strapped actors. &quot;Runs&quot; resolves logistical pain points early using WhatsApp loops.
                    </p>
                  </div>

                  {/* 5-errands visual block */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider mb-3">
                      Top 5 High-Frequency Campus Campus Runs (UNN-Style)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      <div className="border border-slate-100 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold h-6 w-6 rounded-full bg-[#008751]/10 text-[#008751] flex items-center justify-center">1</span>
                          <span className="text-xs font-bold text-slate-800">Chitis Fast-Food / Franco Okpa Run</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Students order hot Okpa, Fanta, puff-puff or swallow during lectures. High urgency due to dietary time windows.
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Est. Price: ₦400 - ₦600</span>
                          <span className="text-[#008751]">Time Premium: High</span>
                        </div>
                      </div>

                      <div className="border border-slate-100 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">2</span>
                          <span className="text-xs font-bold text-slate-800">JGI Library Manuals Printing Run</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Urgent morning lecture notes / assignment manuals printing, binding and delivery. Fast turnaround is non-negotiable.
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Est. Price: ₦500 - ₦800</span>
                          <span className="text-blue-700">Time Premium: Critical</span>
                        </div>
                      </div>

                      <div className="border border-slate-100 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold h-6 w-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">3</span>
                          <span className="text-xs font-bold text-slate-800">Borehole Water Hauling Run</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Hostel water outages are routine. Students pay runners to lug 20-litre jerrycans from substation taps up high-density hostel stairwells.
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Est. Price: ₦600 - ₦1000</span>
                          <span className="text-amber-700">Labor Tier: Extreme</span>
                        </div>
                      </div>

                      <div className="border border-slate-100 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">4</span>
                          <span className="text-xs font-bold text-slate-800">Margret Ekpo Grocery Delivery</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Purchasing household bulk provisions (detergent, cereals, eggs) from gate stores, freeing students from taking expensive shuttle buses.
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Est. Price: ₦700 - ₦1200</span>
                          <span className="text-purple-700">Time Premium: Low</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actor Personas */}
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider mb-2">Requester vs Fulfiller Persona Modeling</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                        <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-emerald-700" />
                          The Requester (High-Stress Student)
                        </h4>
                        <ul className="text-[11px] text-slate-700 mt-2 space-y-1.5 list-disc pl-3">
                          <li>Heavily constrained by exam preparation schedules</li>
                          <li>Recovers time by outsourcing low-leverage physical errands</li>
                          <li>Spends from micro-allowance balances via P2P transfers</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-600" />
                          The Runner (Micro-Income Fulfiller)
                        </h4>
                        <ul className="text-[11px] text-slate-700 mt-2 space-y-1.5 list-disc pl-3">
                          <li>Has schedule gaps; seeks opportunistic income</li>
                          <li>Often accepts runs moving in the identical direction</li>
                          <li>Utilizes cash payments from Runs to subsidize school books</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Complete MVP Lifecycle Mapping */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider">The 72-Hour MVP Request Lifecycle</h3>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      
                      <div className="relative">
                        <span className="absolute -left-5.5 top-0.5 h-3.5 w-3.5 rounded-full border bg-white border-[#008751] flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#008751]"></span>
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">Step 1: Raw Client Push (WhatsApp Broadcaster)</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">The user pastes a freeform errand wish into our WhatsApp text prompt. This mimics dropping requests into WhatsApp peer-to-peer groups.</p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-5.5 top-0.5 h-3.5 w-3.5 rounded-full border bg-white border-blue-500 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">Step 2: AI Parsing / Intake Matrix</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">Central dispatch (simulated in our right panel) extracts categories, picking targets, price tags and issues automated visual alerts.</p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-5.5 top-0.5 h-3.5 w-3.5 rounded-full border bg-white border-amber-500 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">Step 3: Dispatch Hold and Escrow</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">Vetted student runners accept notifications on group channels. Funds are verbally/digitally locked in escrow prior to dispatch.</p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-5.5 top-0.5 h-3.5 w-3.5 rounded-full border bg-white border-emerald-500 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">Step 4: Secure Proof Delivery</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">The runner buys the goods with immediate photo receipt proofs via WhatsApp. Escrow is released automatically on final handoff.</p>
                      </div>

                    </div>
                  </div>

                </motion.div>
              )}

              {/* 2. SYSTEM ARCHITECTURE & DATA SCHEMAS */}
              {activeTab === "architecture" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-indigo-600" />
                      MVP Architecture & Lean Data Models
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Our architecture prioritizes rapid development cycles over premature scaling. Below are our concrete data structures and state machine definitions for a 72-hour launch window.
                    </p>
                  </div>

                  {/* Schema Display Board */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">MVP Core Schema Dictionary</span>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">TypeScript Declarations</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-200">
                        <div className="flex justify-between items-center text-slate-400 mb-1 border-b border-slate-800 pb-1">
                          <span>interface ErrandRequest</span>
                          <span className="text-emerald-500">model</span>
                        </div>
                        <p className="text-slate-500">{"// Persists core errand states"}</p>
                        <p><span className="text-pink-400">id:</span> string;</p>
                        <p><span className="text-pink-400">details:</span> string;</p>
                        <p><span className="text-pink-400">category:</span> ErrandCategory;</p>
                        <p><span className="text-pink-400">sourceLocation:</span> string;</p>
                        <p><span className="text-pink-400">destLocation:</span> string;</p>
                        <p><span className="text-pink-400">offeredFee:</span> number; <span className="text-slate-500">{"// Naira"}</span></p>
                        <p><span className="text-pink-400">status:</span> ErrandStatus;</p>
                        <p><span className="text-pink-400">runnerID:</span> string | null;</p>
                        <p><span className="text-pink-400">proofOfTransit:</span> string; <span className="text-slate-500">{"// URL"}</span></p>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-200">
                        <div className="flex justify-between items-center text-slate-400 mb-1 border-b border-slate-800 pb-1">
                          <span>interface StudentRunner</span>
                          <span className="text-emerald-500">model</span>
                        </div>
                        <p className="text-slate-500">{"// Vetted runner entities"}</p>
                        <p><span className="text-pink-400">id:</span> string;</p>
                        <p><span className="text-pink-400">fullName:</span> string;</p>
                        <p><span className="text-pink-400">hostelRoomRoom:</span> string;</p>
                        <p><span className="text-pink-400">trustRating:</span> number; <span className="text-slate-500">{"// 1-5 scale"}</span></p>
                        <p><span className="text-pink-400">completedRuns:</span> number;</p>
                        <p><span className="text-pink-400">verifiedVouchBy:</span> string; <span className="text-slate-500">{"// room ref"}</span></p>
                        <p><span className="text-pink-400">escrowLockBalance:</span> number;</p>
                      </div>

                    </div>
                  </div>

                  {/* Flow Charts & State Transitions */}
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider mb-3">Escrow Protected State transitions</h3>
                    
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="border border-amber-200 bg-amber-50 p-2.5 rounded-lg">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-bold">1. REQUESTED</span>
                        <p className="text-[9px] text-slate-600 mt-1">User posts to WhatsApp stream. Intake parsing registers run fee.</p>
                      </div>
                      <div className="border border-blue-200 bg-blue-50 p-2.5 rounded-lg">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-blue-800 font-bold">2. ACCEPTED</span>
                        <p className="text-[9px] text-slate-600 mt-1">Runner claims dispatch. Locking mechanism holds run for 15 mins.</p>
                      </div>
                      <div className="border border-indigo-200 bg-[#ebf0ff] p-2.5 rounded-lg">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-900 font-bold">3. IN-PROGRESS</span>
                        <p className="text-[9px] text-slate-600 mt-1">Runner purchases item. Active transit map tracker alerts client.</p>
                      </div>
                      <div className="border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 font-bold">4. COMPLETED</span>
                        <p className="text-[9px] text-slate-600 mt-1">Handoff complete. Escrow payouts disbursed to runner balances.</p>
                      </div>
                    </div>
                  </div>

                  {/* Frontend/Backend flows summary */}
                  <div className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-700">
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider">How to Fake Automation Early</h3>
                    <p className="leading-relaxed">
                      Instead of building complex database rules and live geolocation websockets immediately, &quot;Runs&quot; implements a Manual Concierge Architecture for its initial 72h launch:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Front-End Interface:</strong> A simple responsive PWA launcher handles request collection.</li>
                      <li><strong>Human Back-End Layer:</strong> A single dispatcher handles group alerts. When a dispatcher registers a request, they copy-paste it into WhatsApp broadcasting group links.</li>
                      <li><strong>The Match Engine:</strong> Runners reply with simple strings like <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">#RUN-1003 ACCEPT</code>. The dispatcher coordinates holds.</li>
                    </ul>
                  </div>

                </motion.div>
              )}

              {/* 3. MATCHING LOGIC & TRUST SYSTEMS */}
              {activeTab === "matching" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-700" />
                      Dispatch Matching & Trust Hardening (Zero-KYC)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Our dispatch pipeline shifts incrementally from a concierge WhatsApp-loop to algorithmic batch optimization. Trust matrices prevent bad actors without bureaucratic friction.
                    </p>
                  </div>

                  {/* Algorithm Batch Optimizer Slide Simulator */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Campus Batching Route Optimizer</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Simulate how consolidating multiple grocery or food runs to the same hostel segment boosts economy.</p>
                      </div>
                      <span className="text-[10.5px] bg-[#008751]/10 text-[#008751] px-2 py-0.5 rounded font-semibold">Stage-2 Prototype</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-slate-600 font-medium flex justify-between">
                            <span>Pending Food Runs to Balewa Hall</span>
                            <span className="font-bold text-[#008751]">{simulatedOkpaRequestsCount} Requests</span>
                          </label>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            value={simulatedOkpaRequestsCount} 
                            onChange={(e) => setSimulatedOkpaRequestsCount(parseInt(e.target.value))}
                            className="w-full accent-[#008751]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-600 font-medium flex justify-between">
                            <span>Avg. Hostel Transit Distance</span>
                            <span className="font-bold text-[#008751]">{averageHostelDistance} km</span>
                          </label>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2.5" 
                            step="0.1" 
                            value={averageHostelDistance} 
                            onChange={(e) => setAverageHostelDistance(parseFloat(e.target.value))}
                            className="w-full accent-[#008751]"
                          />
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 text-[11px]">
                        <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1">
                          <span>Standalone Deliveries:</span>
                          <span className="font-mono text-slate-800">₦{simulatedOkpaRequestsCount * individualRunFee} total</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Batched Discounted Price (Requester):</span>
                          <span className="font-bold text-emerald-800">₦{batchedRunFee} / per user</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Consolidated Runner Earnings:</span>
                          <span className="font-bold text-indigo-700">₦{batchedRunnerEarning} total run</span>
                        </div>
                        <div className="bg-[#008751]/5 text-[#008751] p-2 rounded text-[10px] leading-relaxed">
                          ⚡ <strong>Batching Impact:</strong> By combining these {simulatedOkpaRequestsCount} orders into a single batch route from Chitis to Balewa Hall, the runner&apos;s hourly wage surges up to{" "}
                          <strong>₦{Math.round(batchedRunnerEarning / (0.5 + averageHostelDistance * 0.2))} / hr</strong> while saving individual requesters 30% in delivery costs!
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Trust Matrices & Verification */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider">Identity-Lite Trust Matrix</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          Hostel Endorsement
                        </h4>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          No BVN/KYC barrier early. We register runner Room Number verified against Hostel Porter lists. Block Reps act as trusted guarantors.
                        </p>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                          Reputation Escrow
                        </h4>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Runners with high average ratings get prioritized high-value orders (e.g. expensive textbooks/gadgets) with access to early booking pipelines.
                        </p>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-red-500" />
                          The Safety Lockout
                        </h4>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Failing to buy order or delaying deliveries beyond 35 mins without proof generates an immediate suspension of the runner&apos;s micro-payout.
                        </p>
                      </div>

                    </div>

                    {/* Interactive Trust Matrix Rating Adjuster */}
                    <div className="p-3 bg-slate-100 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="font-bold text-slate-700">Interactive Vouch & rating check:</span>
                        <p className="text-[10px] text-slate-500">Slide runner ratings to see matching permissions:</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="3.0" 
                          max="5.0" 
                          step="0.1" 
                          value={runnerRatingInput} 
                          onChange={(e) => setRunnerRatingInput(parseFloat(e.target.value))}
                          className="w-24 md:w-32 accent-emerald-600"
                        />
                        <span className="font-mono font-bold bg-white px-2 py-1 rounded text-slate-800 border min-w-12 text-center">
                          ⭐ {runnerRatingInput.toFixed(1)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          runnerRatingInput >= 4.5 ? "bg-emerald-100 text-emerald-800" :
                          runnerRatingInput >= 4.0 ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        }`}>
                          {runnerRatingInput >= 4.5 ? "Tier-1 VIP: Clear for high value custom gadgets" :
                           runnerRatingInput >= 4.0 ? "Tier-2 Standard: Allowed on food & groceries" : "Suspension Warning: Food only under ₦400"}
                        </span>
                      </div>
                    </div>

                  </div>

                </motion.div>
              )}

              {/* 4. MONETIZATION & EXPANSION HOOKS */}
              {activeTab === "economics" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-700" />
                      Dynamic Micros-Economics & Growth Flywheel
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Our system relies on direct WhatsApp viral channels, organic referral loops, and structural surge parameters to reward student-runners while capturing sustainable revenue.
                    </p>
                  </div>

                  {/* Pricing and Surge Simulator */}
                  <div className="bg-[#008751]/5 border border-[#008751]/10 rounded-xl p-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#008751] uppercase tracking-wide">Dynamic Campus Surge Pricing Calculator</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">Toggle live campus environment factors to see how payout structures dynamically calculate to handle constraints.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-600 font-medium">Base Errand Run Fee (NGN ₦):</label>
                          <input 
                            type="number" 
                            step="50"
                            min="300"
                            max="1500"
                            value={baseRunFee} 
                            onChange={(e) => setBaseRunFee(Math.max(300, parseInt(e.target.value) || 300))}
                            className="w-full mt-1 px-3 py-1.5 rounded bg-white border border-slate-200 font-mono text-slate-800"
                          />
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Surge Multiplier Modifiers</span>
                          
                          <label className="flex items-center gap-2 cursor-pointer border p-1 px-2 rounded hover:bg-white bg-slate-50/50">
                            <input 
                              type="checkbox" 
                              checked={surgeLateNight} 
                              onChange={(e) => setSurgeLateNight(e.target.checked)}
                              className="accent-emerald-600"
                            />
                            <span>Late Night Run (10 PM+): +30%</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer border p-1 px-2 rounded hover:bg-white bg-slate-50/50">
                            <input 
                              type="checkbox" 
                              checked={surgeHeavyRain} 
                              onChange={(e) => setSurgeHeavyRain(e.target.checked)}
                              className="accent-emerald-600"
                            />
                            <span>Heavy Rain Storm: +40%</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer border p-1 px-2 rounded hover:bg-white bg-slate-50/50">
                            <input 
                              type="checkbox" 
                              checked={surgeWaterCrisis} 
                              onChange={(e) => setSurgeWaterCrisis(e.target.checked)}
                              className="accent-emerald-600"
                            />
                            <span>Severe Water Outage: +50%</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer border p-1 px-2 rounded hover:bg-white bg-slate-50/50">
                            <input 
                              type="checkbox" 
                              checked={isPrioritySurcharge} 
                              onChange={(e) => setIsPrioritySurcharge(e.target.checked)}
                              className="accent-emerald-600"
                            />
                            <span>Priority Submissions (+₦250 flat)</span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-white border border-[#008751]/20 rounded-lg p-4 flex flex-col justify-between">
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs pb-1.5 border-b">
                            <span className="text-slate-500 uppercase tracking-wider font-semibold">Consolidated Fee structures:</span>
                            <span className="font-mono font-bold text-[#008751]">Surge Active</span>
                          </div>
                          
                          <div className="flex justify-between text-slate-600 text-xs">
                            <span>Base Cost:</span>
                            <span className="font-mono">₦{baseRunFee}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 text-xs text-amber-800">
                            <span>Surge Multipliers active:</span>
                            <span className="font-mono font-semibold">
                              x{((surgeLateNight?0.3:0)+(surgeHeavyRain?0.4:0)+(surgeWaterCrisis?0.5:0)+1.0).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-bold pt-1 text-slate-800 border-t">
                            <span>Total Client Payout:</span>
                            <span className="font-mono text-base text-[#008751]">₦{totalCalculatedFee}</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded text-xs mt-3">
                          <div className="flex justify-between text-slate-600">
                            <span>Runner Share (85%):</span>
                            <span className="font-mono text-slate-800 font-bold">₦{runnerEarnings}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Platform Fee (15%):</span>
                            <span className="font-mono text-[#008751] font-bold">₦{companyComissions}</span>
                          </div>
                        </div>
                        
                      </div>

                    </div>
                  </div>

                  {/* Growth Strategy & Viral Loops */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-700">
                    <h3 className="text-sm font-bold uppercase text-slate-600 tracking-wider">Growth Strategy: The WhatsApp Viral Loop</h3>
                    <p className="leading-relaxed">
                      University residents congregate inside active WhatsApp groups categorized by department and hostel blocks. &quot;Runs&quot; exploits this organic container to kickstart virality:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-[11px]">
                      
                      <div className="border border-slate-100 p-2.5 bg-slate-50 rounded">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Share2 className="h-3 w-3 text-[#008751]" />
                          Referral Incentive Loops
                        </span>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          Requesters earn 1 free priority delivery for every 3 hostel mates referred who place an active delivery.
                        </p>
                      </div>

                      <div className="border border-slate-100 p-2.5 bg-slate-50 rounded">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-[#008751]" />
                          Departmental Ambassadors
                        </span>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          Saddle course reps in Chemistry, Math, and Engineering faculties with verified voucher promo codes to capture first-time print runs.
                        </p>
                      </div>

                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          </div>

        {/* RIGHT COLUMN: Interactive Live Action Sandbox Simulator (Cols: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Sandbox Controls Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-md flex flex-col gap-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-emerald-400">P2P Errand simulation Sandbox</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            {/* Simulated Accounting ledger */}
            <div className="grid grid-cols-2 gap-4 bg-black/30 p-3 rounded-lg border border-white/5 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Accumulated Platform 15% Fees</span>
                <span className="font-mono text-lg font-bold text-emerald-400">₦{runsAccumulatedCommissions}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Total Disbursed to Runners</span>
                <span className="font-mono text-lg font-bold text-white">₦{totalDisbursedToRunners}</span>
              </div>
            </div>

            {/* WhatsApp raw request intake Console */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-medium">WhatsApp Request Parser Console</label>
                <span className="text-[9px] text-slate-400">P2P Student group chat input</span>
              </div>

              {/* Presets tags */}
              <div className="flex flex-wrap gap-1">
                {WHATSAPP_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setRawWhatsAppMessage(preset.text)}
                    className="text-[9.5px] bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 px-2 rounded border border-white/5 flex items-center gap-1.5 transition-all"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {preset.title}
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={rawWhatsAppMessage}
                  onChange={(e) => setRawWhatsAppMessage(e.target.value)}
                  placeholder="Paste raw WhatsApp text request here..."
                  className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 min-h-24 resize-y leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                
                {/* AI Concierge parsing with Gemini model */}
                <button
                  type="button"
                  onClick={handleAICopingMechanism}
                  disabled={isParsingAI || !rawWhatsAppMessage.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                  {isParsingAI ? "AI Parsing with AI..." : "Intelligent AI Parse"}
                </button>

                {/* Direct instant dispatch fallback mechanism */}
                <button
                  type="button"
                  onClick={handleDirectMvpDispatch}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all"
                  title="Bypass Gemini API for immediate local simulation dispatch"
                >
                  Fast Dispatch
                </button>

              </div>

              {aiError && (
                <div className="bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 p-2 rounded text-[10px] flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-indigo-400 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            {/* Simulated WhatsApp Alerts notification feed */}
            <div className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 border-b border-white/5 pb-1 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded bg-emerald-500"></span>
                WhatsApp &quot;Runs dispatch bot&quot; group alerts
              </span>
              <div className="max-h-20 overflow-y-auto font-mono text-[9.5px] text-zinc-300 space-y-1.5 scrollbar-thin">
                {whatsappGroupAlerts.map((log, index) => (
                  <p key={index} className="leading-snug bg-slate-900/40 p-1.5 rounded">{log}</p>
                ))}
              </div>
            </div>

          </div>

          {/* Active board feed & smart layout */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-700" />
                Active Campus Errand Feed
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold">
                {errands.length} items
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {errands.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSandboxErrandId(item.id)}
                  className={`border rounded-xl p-3.5 text-xs transition-all cursor-pointer ${
                    selectedSandboxErrandId === item.id
                      ? "border-[#008751] bg-[#008751]/5 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1 pb-1.5 border-b border-dashed border-slate-200">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] font-bold text-[#008751]">{item.id}</span>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <span>{item.category} run</span>
                        <span>•</span>
                        <span className="text-slate-600 font-bold">{item.urgency}</span>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      item.status === ErrandStatus.REQUESTED ? "bg-amber-100 text-amber-800 scale-95" :
                      item.status === ErrandStatus.ACCEPTED ? "bg-blue-100 text-blue-800" :
                      item.status === ErrandStatus.IN_PROGRESS ? "bg-indigo-100 text-indigo-800" :
                      "bg-emerald-100 text-emerald-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-800 text-[11.5px] mt-2 line-clamp-2 leading-relaxed">{item.details}</p>

                  <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-2 rounded text-[10.5px] text-slate-600">
                    <div>
                      <span className="block text-[9.5px] text-slate-400">Pickup Location:</span>
                      <strong className="text-slate-700">{item.source}</strong>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-slate-400">Hostel Destination:</span>
                      <strong className="text-slate-700">{item.destination}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-[11px] font-bold">
                    <span className="text-slate-500">
                      Payout: <strong className="text-slate-800">₦{item.fee}</strong>
                    </span>
                    <span className="text-[10px] font-serif italic text-indigo-700 flex items-center gap-1">
                      {item.riskLevel !== "Standard" && (
                        <>
                          <AlertCircle className="h-3 w-3 inline text-indigo-500" />
                          {item.riskLevel} complexity
                        </>
                      )}
                    </span>
                  </div>

                  {item.feedback && (
                    <div className="mt-2 text-[10px] bg-slate-100 p-2 rounded border border-slate-200/50 leading-relaxed text-slate-600 font-medium">
                      🤖 <strong>AI Strategic Advisory / Context:</strong> {item.feedback}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>

          {/* Interactive UNN campus Map Arena */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Intelligent Campus Arena Visualization
              </h3>
              <span className="text-[9px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded">
                Live Paths
              </span>
            </div>

            {/* Relative Grid representing UNN Campus */}
            <div className="bg-zinc-950 h-56 rounded-lg relative overflow-hidden border border-zinc-800/80">
              
              {/* Grid Background Accent Lines */}
              <div className="absolute inset-0 bg-grid-white/[0.02]" />

              {/* Source/Pickup Pins - render dynamically */}
              {Object.values(CAMPUS_LOCATIONS).map((loc) => (
                <div
                  key={loc.name}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${loc.type === "pickup" ? "bg-emerald-400" : "bg-red-400"} ring-4 ring-white/10`} />
                  
                  {/* Styled Floating popup label */}
                  <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[8px] bg-zinc-900 border border-zinc-800/80 text-zinc-300 font-mono scale-90 px-1 rounded whitespace-nowrap min-w-10 text-center select-none group-hover:bg-zinc-800">
                    {loc.alias}
                  </span>
                </div>
              ))}

              {/* Dynamic Action Line representing the runner path if active */}
              {activeSandboxErrand && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  
                  {/* Connect source coords with dest coords via dynamic SVG path */}
                  <g className="opacity-60">
                    <line
                      x1={`${activeSandboxErrand.sourceCoords.x}%`}
                      y1={`${activeSandboxErrand.sourceCoords.y}%`}
                      x2={`${activeSandboxErrand.destCoords.x}%`}
                      y2={`${activeSandboxErrand.destCoords.y}%`}
                      stroke="url(#routeGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="5,3"
                      className="animate-dash"
                    />
                  </g>
                </svg>
              )}

              {/* Moving representation of the Runner in transit */}
              {activeSandboxErrand && (
                <motion.div
                  style={{
                    position: "absolute",
                    left: `${activeSandboxErrand.status === ErrandStatus.REQUESTED || activeSandboxErrand.status === ErrandStatus.ACCEPTED 
                      ? activeSandboxErrand.sourceCoords.x 
                      : activeSandboxErrand.status === ErrandStatus.IN_PROGRESS 
                      ? (activeSandboxErrand.sourceCoords.x + activeSandboxErrand.destCoords.x) / 2 
                      : activeSandboxErrand.destCoords.x}%`,
                    top: `${activeSandboxErrand.status === ErrandStatus.REQUESTED || activeSandboxErrand.status === ErrandStatus.ACCEPTED 
                      ? activeSandboxErrand.sourceCoords.y 
                      : activeSandboxErrand.status === ErrandStatus.IN_PROGRESS 
                      ? (activeSandboxErrand.sourceCoords.y + activeSandboxErrand.destCoords.y) / 2 
                      : activeSandboxErrand.destCoords.y}%`
                  }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-4 h-4 rounded-full bg-emerald-400 border border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-20"
                >
                  <span className="text-[7.5px] font-bold text-zinc-950 font-mono">R</span>
                </motion.div>
              )}

            </div>

            <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
              <span>● Emerald: Pickup stations</span>
              <span>● Coral Red: Hostel Dormitories</span>
            </div>

          </div>

          {/* Handheld Smartphone Runner Terminal emulator */}
          <div className="bg-slate-100 border border-slate-300 rounded-2xl p-5 shadow-xs flex flex-col gap-4 relative">
            
            <div className="flex items-center gap-2 border-b pb-2 border-slate-200">
              <Smartphone className="h-5 w-5 text-[#008751]" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Runner Handset Interface</h4>
                <p className="text-[10px] text-slate-500">Simulate taking the driver/runner action state</p>
              </div>
            </div>

            {activeSandboxErrand ? (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                
                {/* Active claimed metadata */}
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="space-y-0.5 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-slate-400 block">SELECTED ERRAND FOR DISPATCH</span>
                    <strong className="text-xs text-slate-800 font-mono">{activeSandboxErrand.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">TOTAL REVENUE (₦)</span>
                    <strong className="text-xs text-[#008751] font-mono">₦{activeSandboxErrand.fee}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic border-l-2 border-[#008751] pl-3 py-1 bg-emerald-50/20 font-medium leading-relaxed">
                  &quot;{activeSandboxErrand.details}&quot;
                </p>

                {/* State advancing buttons */}
                <div className="space-y-2 pt-2">
                  
                  {activeSandboxErrand.status === ErrandStatus.REQUESTED && (
                    <button
                      type="button"
                      onClick={() => handleStateAdvance(activeSandboxErrand.id, ErrandStatus.ACCEPTED)}
                      className="w-full bg-[#008751] hover:bg-emerald-800 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                    >
                      <span>1. Accept & Claim Run Matrix</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {activeSandboxErrand.status === ErrandStatus.ACCEPTED && (
                    <button
                      type="button"
                      onClick={() => handleStateAdvance(activeSandboxErrand.id, ErrandStatus.IN_PROGRESS)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                    >
                      <span>2. Buy Items & Trigger Transit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {activeSandboxErrand.status === ErrandStatus.IN_PROGRESS && (
                    <button
                      type="button"
                      onClick={() => handleStateAdvance(activeSandboxErrand.id, ErrandStatus.COMPLETED)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>3. Confirm Complete / Collect Payout</span>
                    </button>
                  )}

                  {activeSandboxErrand.status === ErrandStatus.COMPLETED && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-3 text-center text-xs font-semibold flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 bg-emerald-500 text-white rounded-full p-0.5" />
                      Platform Commission Released and Payout Settled successfully!
                    </div>
                  )}

                </div>

                <div className="text-[10px] leading-relaxed text-slate-500 pt-1 flex items-center gap-1 justify-center bg-slate-50 p-2 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>Transition mapping updates live visual campus path above!</span>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Select or dispatch an errand request to activate terminal actions.</p>
            )}

          </div>

        </div>

      </div>

      {/* Aesthetic Footer - Genuine, Minimalist, No Margin Clutter */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8 text-xs text-slate-500 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-800">RUNS - Peer-to-Peer Campus Errand Network MVP Blueprint</p>
          <p>Created with zero initial funding and designed for Nigerian high-density campus micro-economies (such as UNN Nsukka).</p>
          <p className="text-[10px] text-slate-400">Copyright © 2026 Runs Network Node. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}

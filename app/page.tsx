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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-[#008751]/30 flex flex-col relative">
      
      {/* Dynamic ambient backwash orbs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* STICKY TOP NAV: Fully optimized brand banner */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#008751] flex items-center justify-center text-white font-mono font-black tracking-tighter text-2xl shadow-md border border-emerald-500/10">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                    RUNS <span className="text-[#008751]">UNN</span>
                  </h1>
                  <span className="hidden sm:inline-flex text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase px-1.5 py-0.5 rounded font-mono font-black tracking-wider items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Peer-to-Peer Campus Errand Escrow Network</p>
              </div>
            </div>

            {/* Quick Mobile Clock & Status */}
            <div className="md:hidden flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-white font-bold">{currentTime}</span>
            </div>
          </div>

          {/* Real-time Ledger Overview Header widgets (real values) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end text-xs font-mono">
            
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-black">Escrow Liquid:</span>
              <span className="text-white font-bold text-xs">₦{(accumulatedCommissions + totalDisbursedToRunners + 2000).toLocaleString()}</span>
            </div>

            <div className="bg-[#008751]/10 border border-emerald-800/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 uppercase font-black">Runner Disbursed:</span>
              <span className="text-emerald-300 font-bold text-xs">₦{totalDisbursedToRunners.toLocaleString()}</span>
            </div>

            <div className="bg-indigo-950/60 border border-indigo-800/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] text-indigo-400 uppercase font-black">Runs revenue (15%):</span>
              <span className="text-indigo-300 font-bold text-xs">₦{accumulatedCommissions.toLocaleString()}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>UNN Local: <strong className="text-white">{currentTime}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* DESKTOP/LAPTOP NAVIGATION BAR & MOBILE RESPONSIVE SWITCHER TABS */}
      <nav className="hidden md:block bg-slate-950 border-b border-slate-800 py-1.5 sticky top-[73px] md:top-[77px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "feed", label: "Active Feed", icon: Activity },
            { id: "create", label: "Dispatch Errand", icon: PlusCircle },
            { id: "map", label: "Interactive Map", icon: MapIcon },
            { id: "escrow", label: "Escrow & Surge", icon: Wallet },
            { id: "playbook", label: "Product Specs & Strategy", icon: BookOpen }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-2 px-4 rounded-lg font-mono text-[11px] font-bold uppercase flex items-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  active 
                    ? "bg-[#008751] text-white border border-emerald-600 shadow-lg shadow-emerald-950/40" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MOBILE NATIVE FIXED BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2.5 px-3 flex justify-around items-center z-50">
        {[
          { id: "feed", label: "Feed", icon: Activity },
          { id: "create", label: "Dispatch", icon: PlusCircle },
          { id: "map", label: "Map", icon: MapIcon },
          { id: "escrow", label: "Escrow", icon: Wallet },
          { id: "playbook", label: "Playbook", icon: BookOpen }
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                active 
                  ? "text-[#008751] font-extrabold" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-mono tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CORE FRAMEWORK: Unified Dynamic Layout fitting both Mobile and Laptop natively */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pt-6 pb-24 md:pb-6 flex flex-col gap-6">

        {/* SCREEN SECTION 1: FEED & MAP VIEWPORT SIDE BY SIDE ON DESKTOP */}
        {activeTab === "feed" && (
          <div className="flex flex-col gap-4 w-full">
            
            {/* Mobile-only toggle switcher for Cards vs Map Tracker */}
            <div className="lg:hidden flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full mb-1">
              <button
                onClick={() => setMobileFeedView("cards")}
                className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                  mobileFeedView === "cards"
                    ? "bg-[#008751] text-white font-extrabold shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📋 Errand Feed ({filteredErrands.length})
              </button>
              <button
                onClick={() => setMobileFeedView("tracker")}
                className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                  mobileFeedView === "tracker"
                    ? "bg-[#008751] text-white font-extrabold shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📍 Live Track ({activeErrand.id})
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Errands List Column (7/12 Columns) */}
              <div className={`col-span-1 lg:col-span-7 flex flex-col gap-4 ${mobileFeedView === "cards" ? "flex" : "hidden lg:flex"}`}>
              
              {/* Filter controls */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search landmarks, hostels, food wraps..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-base md:text-xs text-slate-200 outline-hidden focus:border-[#008751]/60 font-mono"
                    />
                  </div>
                  
                  {/* Category select buttons widget */}
                  <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {["ALL", "FOOD", "PRINTING", "WATER", "GROCERY"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase font-black whitespace-nowrap transition-colors cursor-pointer ${
                          categoryFilter === cat 
                            ? "bg-slate-800 text-white border border-slate-700" 
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                  <span>Showing <strong className="text-white">{filteredErrands.length}</strong> available campus runs</span>
                  <span className="flex items-center gap-1 text-[#008751]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Matches Updated
                  </span>
                </div>
              </div>

              {/* Errand Cards List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredErrands.map((errand) => {
                    const isSelected = selectedErrandId === errand.id;
                    const statusColors = {
                      [ErrandStatus.REQUESTED]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      [ErrandStatus.ACCEPTED]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      [ErrandStatus.IN_PROGRESS]: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      [ErrandStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
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
                        className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs relative flex flex-col justify-between ${
                          isSelected 
                            ? "bg-slate-950 border-[#008751]/80 ring-2 ring-[#008751]/20" 
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                        }`}
                      >
                        <div>
                          {/* Upper Card Grid */}
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{categoryEmotes[errand.category]}</span>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase">{errand.id}</span>
                                <h3 className="text-white font-bold text-xs md:text-sm tracking-tight mt-0.5 line-clamp-1">{errand.details}</h3>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="font-mono text-xs md:text-sm font-black text-emerald-400">₦{errand.fee}</span>
                              <span className="text-[9px] font-mono text-slate-500">{errand.urgency}</span>
                            </div>
                          </div>

                          {/* Middle Route Markers */}
                          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between text-[11px] mb-3">
                            <div className="flex items-center gap-1.5 max-w-[45%]">
                              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-slate-300 font-mono truncate">{errand.source}</span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0 mx-2" />
                            <div className="flex items-center gap-1.5 max-w-[45%] justify-end">
                              <span className="text-slate-300 font-mono truncate">{errand.destination}</span>
                              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* Lower Status Indicator & Details */}
                        <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 text-[10px] sm:text-xs">
                          <span className={`px-2 py-0.5 rounded font-mono border ${statusColors[errand.status]}`}>
                            {errand.status}
                          </span>
                          
                          <div className="flex items-center gap-2 text-slate-400 font-mono">
                            {errand.runnerName !== "Unassigned" ? (
                              <span className="flex items-center gap-1.5">
                                <User className="h-3 w-3 text-indigo-400" />
                                <span>Runner: <strong className="text-slate-200">{errand.runnerName}</strong></span>
                              </span>
                            ) : (
                              <span className="text-amber-500 font-bold animate-pulse uppercase tracking-wider text-[9px]">
                                waiting for grab
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredErrands.length === 0 && (
                    <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                      <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-mono">No student runs matched your filter query.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Interactive Workspace Panel (5/12 Columns - SVG map and dispatch actions stacked) */}
            <div className={`col-span-1 lg:col-span-5 space-y-6 ${mobileFeedView === "tracker" ? "block" : "hidden lg:block"}`}>
              
              {/* Active Detailed Errand Card & Simulation controller */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold">Active Controller</span>
                    <h2 className="text-sm font-bold text-white uppercase font-mono tracking-widest mt-0.5">Release & Track</h2>
                  </div>
                  <span className="text-[10.5px] font-mono text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    {activeErrand.id}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-500">REQUESTER:</span>
                    <strong className="text-white font-mono">{activeErrand.requesterName}</strong>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 font-medium italic bg-slate-900 p-3 rounded-lg border border-slate-800/60">
                    &quot;{activeErrand.details}&quot;
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-mono">COMPLEXITY</span>
                      <p className="text-slate-300 mt-0.5 text-[10.5px] leading-snug">{activeErrand.complexity}</p>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-mono font-bold">RISK RATING</span>
                      <p className={`font-mono mt-0.5 text-[11px] font-bold ${
                        activeErrand.riskLevel.includes("Critical") || activeErrand.riskLevel.includes("High") 
                          ? "text-rose-400" 
                          : "text-amber-400"
                      }`}>{activeErrand.riskLevel}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block font-mono">ESCROW COMMENTS</span>
                    <p className="text-[11px] text-slate-400 mt-0.2 leading-relaxed">{activeErrand.feedback}</p>
                  </div>
                </div>

                {/* SIMULATION STEPPER CONTROLS */}
                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block font-bold">
                    Escrow state triggers
                  </span>

                  {activeErrand.status === ErrandStatus.REQUESTED && (
                    <div className="space-y-3">
                      <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded text-[10.5px] text-amber-300 leading-normal">
                        ⚠️ <strong>Escrow locked:</strong> Student requester has deposited the run fee of ₦{activeErrand.fee} into the peer contract. DM dispatcher alert issued.
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStateAdvance(activeErrand.id, ErrandStatus.ACCEPTED)}
                          className="flex-1 py-2.5 bg-[#008751] hover:bg-emerald-600 active:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                        >
                          Lock Contract & Accept Run (Runner side)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeErrand.status === ErrandStatus.ACCEPTED && (
                    <div className="space-y-3">
                      <div className="bg-blue-500/5 border border-blue-500/20 p-2.5 rounded text-[10.5px] text-blue-300 leading-normal">
                        🔑 <strong>Locked by {activeErrand.runnerName}:</strong> Runner has verified coordinates. Escrow holds the secure stake.
                      </div>
                      <button
                        onClick={() => handleStateAdvance(activeErrand.id, ErrandStatus.IN_PROGRESS)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Signal Transit Start (Item Purchased)
                      </button>
                    </div>
                  )}

                  {activeErrand.status === ErrandStatus.IN_PROGRESS && (
                    <div className="space-y-3">
                      <div className="bg-purple-500/5 border border-purple-500/20 p-2.5 rounded text-[10.5px] text-purple-300 leading-normal">
                        ⚡ <strong>In route transit:</strong> Emeka is walking with the item to {activeErrand.destination}.
                      </div>
                      <button
                        onClick={() => handleStateAdvance(activeErrand.id, ErrandStatus.COMPLETED)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Accept Verification & Release Handshake Pay
                      </button>
                    </div>
                  )}

                  {activeErrand.status === ErrandStatus.COMPLETED && (
                    <div className="space-y-1">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400 font-mono font-bold flex items-center gap-2">
                        <span className="text-base">✅</span>
                        Transaction finalized. Payouts released!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Miniature SVG Map visualizer stacked directly inside the panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-md">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-extrabold flex items-center gap-1">
                  <MapIcon className="h-3 w-3" /> Selected Route Tracing Box
                </span>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Live peer-runner pathway from {activeErrand.source} to {activeErrand.destination}</p>
                
                {/* Embedded dynamic vector graphic map */}
                <div className="h-44 bg-slate-900 border border-slate-800 rounded-xl mt-3 relative overflow-hidden flex items-center justify-center">
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
            <div className="col-span-1 lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-md space-y-6">
              
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#008751] font-extrabold">Instant Errand Placement</span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">Submit Your Campus Run</h2>
                <p className="text-xs text-slate-400 mt-1">Choose between parsing a raw WhatsApp message via Gemini AI, or submitting details in our secure structural form.</p>
              </div>

              {/* Order Method Toggle tabs */}
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 w-full max-w-sm">
                <button
                  onClick={() => setOrderMethod("whatsapp")}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                    orderMethod === "whatsapp" 
                      ? "bg-[#008751] text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📟 WhatsApp AI Ingestion
                </button>
                <button
                  onClick={() => setOrderMethod("form")}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                    orderMethod === "form" 
                      ? "bg-[#008751] text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📝 Structural Form
                </button>
              </div>

              {/* METHOD A: WhatsApp text block extraction with real Gemini Hook */}
              {orderMethod === "whatsapp" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-slate-300 block">
                      PASTE COPIED WHATSAPP CHAT MESSAGE BELOW:
                    </label>
                    <textarea
                      rows={5}
                      value={rawWhatsAppMessage}
                      onChange={(e) => setRawWhatsAppMessage(e.target.value)}
                      placeholder="DM copy paste: E.g., Who is near chitis? Pls buy 2 wraps of okpa and a bottle of chilled fanta to Balewa Rm 302..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#008751] outline-hidden p-3.5 rounded-xl text-base md:text-xs text-slate-200 font-mono leading-relaxed resize-none"
                    />
                  </div>

                  {/* Presets Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-black">Quick Pre-loaded Campus Demos:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {WHATSAPP_PRESETS.map((preset, i) => (
                        <div
                          key={i}
                          onClick={() => setRawWhatsAppMessage(preset.text)}
                          className="bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl cursor-pointer text-left transition-all"
                        >
                          <strong className="text-white text-[11px] font-sans block">{preset.title}</strong>
                          <p className="text-[10px] text-slate-400 line-clamp-1 font-mono mt-0.5">{preset.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {aiError && (
                    <div className="p-2.5 border border-amber-500/20 bg-amber-500/5 rounded-lg text-[11px] text-amber-400 font-mono flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {aiError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleAICopingMechanism}
                      disabled={isParsingAI || !rawWhatsAppMessage.trim()}
                      className="flex-1 py-3 bg-[#008751] hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                      className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-xs rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      Instant Bypass Dispatch
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD B: Direct Structured Application Form */}
              {orderMethod === "form" && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-slate-400 font-bold">ERRAND CATEGORY:</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as ErrandCategory)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-hidden focus:border-[#008751] text-base md:text-xs"
                      >
                        <option value={ErrandCategory.FOOD}>🍔 Meal (Chitis / Franco)</option>
                        <option value={ErrandCategory.PRINTING}>🖨️ Document Pressing (JGI / CEC)</option>
                        <option value={ErrandCategory.WATER}>💧 Borhole Water Haulage</option>
                        <option value={ErrandCategory.GROCERY}>🛒 Market provisions / gate items</option>
                        <option value={ErrandCategory.ACADEMIC}>📚 Science / biochemistry labs</option>
                        <option value={ErrandCategory.CUSTOM}>⚙️ Custom Peer Run</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold">PRIORITY / URGENCY:</label>
                      <select
                        value={formUrgency}
                        onChange={(e) => setFormUrgency(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-hidden focus:border-[#008751] text-base md:text-xs"
                      >
                        <option value="Flexible (Within 12h)">Flexible (Within 12h)</option>
                        <option value="Urgent (20-30 mins)">Urgent (20-30 mins)</option>
                        <option value="Time-locked class submit">Time-locked class submit</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold">PICKUP FROM (SOURCE):</label>
                      <select
                        value={formSource}
                        onChange={(e) => setFormSource(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-hidden focus:border-[#008751] text-base md:text-xs"
                      >
                        {Object.keys(CAMPUS_LOCATIONS).filter(k => CAMPUS_LOCATIONS[k].type === "pickup" || CAMPUS_LOCATIONS[k].type === "station").map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold">DELIVER TO (DESTINATION):</label>
                      <select
                        value={formDestination}
                        onChange={(e) => setFormDestination(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-hidden focus:border-[#008751] text-base md:text-xs"
                      >
                        {Object.keys(CAMPUS_LOCATIONS).filter(k => CAMPUS_LOCATIONS[k].type === "dropoff").map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">SECURE CASH PAYOUT COMMITTED (NAIRA):</label>
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="text-base text-slate-400">₦</span>
                      <input 
                        type="number" 
                        min="300"
                        step="50"
                        value={formPayout}
                        onChange={(e) => setFormPayout(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 outline-hidden focus:border-[#008751] text-base md:text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold font-mono">SPECIFIC RUN DETAILS (COCA COLA SPEC, FLAVOR, PRINT SIZE SHIELDS...):</label>
                    <input
                      type="text"
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      placeholder="E.g., 2 wraps of hot Okpa with plantain and cold sprite 50cl ..."
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-hidden focus:border-[#008751] text-base md:text-xs"
                    />
                  </div>

                  <button
                    onClick={handleFormCustomDispatch}
                    className="w-full py-3 mt-2 bg-[#008751] hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg space-y-3">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" /> Vetted Fulfillers Console
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Peer agents release security locks within active hostel rooms on campus to ensure safe deliveries.
                </p>

                <div className="space-y-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400 font-mono">Simulated Runner Rating:</span>
                      <strong className="text-white font-mono">{runnerRatingInput} ⭐</strong>
                    </div>
                    <input 
                      type="range" 
                      min="3.5" 
                      max="5.0" 
                      step="0.1" 
                      value={runnerRatingInput} 
                      onChange={(e) => setRunnerRatingInput(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800"
                    />
                  </div>
                  
                  <div className="flex justify-between text-[11px] border-t border-slate-800 pt-2">
                    <span className="text-slate-400">Escrow Wallet Deposit:</span>
                    <span className="text-white font-bold">₦2,500</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    *Vouch limits correspond cleanly with the active trust rating limit score values.
                  </div>
                </div>
              </div>

              {/* Group Simulator stream alert box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> UNN Dispatch Channel Alerts
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin font-mono text-[10px] leading-relaxed text-zinc-300">
                  {whatsappGroupAlerts.map((log, index) => (
                    <div 
                      key={index}
                      className="p-2 rounded bg-slate-900 border border-slate-800/60"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SCREEN SECTION 3: INTERACTIVE CAMPUS MAP */}
        {activeTab === "map" && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-lg space-y-4">
            
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#008751] font-extrabold">Nsukka Campus Hub</span>
                <h2 className="text-lg font-bold text-white tracking-tight">University of Nigeria (UNN) Route Layout</h2>
                <p className="text-xs text-slate-400 mt-0.5">High-intensity landmark coordinate hubs and active running delivery pipelines.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-[11.5px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Pickup Stalls
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span> Dropoff Hostels
                </span>
              </div>
            </div>

            {/* Huge full visual Map Grid */}
            <div className="h-[460px] bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
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
                          stroke={isSelected ? "#10b981" : "#475569"} 
                          strokeWidth={isSelected ? "3" : "1.5"} 
                          strokeDasharray={isSelected ? "6,4" : "4,4"}
                          opacity={isSelected ? 1.0 : 0.4}
                          className={isSelected ? "animate-[dash_12s_linear_infinite]" : ""}
                        />
                        {isSelected && (
                          <circle r="4.5" fill="#6366f1" className="animate-ping">
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
                          className="animate-ping"
                        />
                      )}
                      
                      {/* Core circle */}
                      <circle 
                        cx={`${loc.x}%`} 
                        cy={`${loc.y}%`} 
                        r={isActive ? "7.5" : "5.5"} 
                        fill={loc.type === "pickup" ? "#10b981" : loc.type === "station" ? "#f59e0b" : "#f43f5e"} 
                        stroke="#0f172a"
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
                    className={`absolute text-[8.5px] sm:text-[9.5px] font-mono px-1.5 py-0.5 rounded border pointer-events-none select-none transition-all ${
                      isSelected 
                        ? "bg-white text-slate-900 border-white scale-110 font-black shadow-lg" 
                        : "bg-slate-950/95 text-slate-400 border-slate-800"
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
              <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 p-3 rounded-lg flex flex-col gap-1.5 text-[10.5px] font-mono">
                <span className="font-bold border-b border-slate-800 pb-1 text-white uppercase text-[9px] tracking-wider">Live tracking map</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Chitis & Franco Pickups
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span> Dormitory Destination Hostels
                </div>
                <div className="flex items-center gap-1.5-amber">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Borehole Station Hubs
                </div>
              </div>
            </div>

            {/* Quick alert panel explanation */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex items-center gap-3">
              <Info className="h-5 w-5 text-indigo-400 shrink-0" />
              <p className="leading-relaxed">
                As errands are entered through the WhatsApp parse flow or custom forms, their geographic pickup and delivery points automatically resolve onto this map grid in real time. Dashed green lines plot currently uncompleted running routes.
              </p>
            </div>

          </div>
        )}

        {/* SCREEN SECTION 4: ESCROW WALLET & SURGE PLAYGROUND */}
        {activeTab === "escrow" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* The Surge Surge Pricing Playground (7/12 Columns) */}
            <div className="col-span-1 lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-md space-y-6">
              
              <div>
                <span className="text-[10px] font-mono uppercase text-[#008751] font-extrabold block">Dynamic Fee Playground</span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">Dynamic Surcharge Calculator</h2>
                <p className="text-xs text-slate-400 mt-1">Simulate real-world conditions like rain, student exam weeks, or hostel water outages to watch dynamic payouts recalculate.</p>
              </div>

              <div className="space-y-4">
                
                {/* Base Run input */}
                <div className="space-y-1.5 font-mono text-xs max-w-xs">
                  <label className="text-slate-400 font-bold">BASE ERRAND FEE guideline (₦):</label>
                  <input
                    type="number"
                    value={baseRunFee}
                    onChange={(e) => setBaseRunFee(parseInt(e.target.value) || 0)}
                    step="50"
                    min="300"
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-200 outline-hidden"
                  />
                </div>

                {/* Surcharges Checklist */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Select active campus surcharges:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    
                    <label className="flex items-center gap-3 bg-slate-900 hover:bg-slate-900/85 border border-slate-800 p-3.5 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={surgeLateNight} 
                        onChange={(e) => setSurgeLateNight(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white font-sans block">Late Night Session (+30%)</strong>
                        <span className="text-[10px] text-slate-500">After 10:00 PM hostel gate closures.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-900 hover:bg-slate-900/85 border border-slate-800 p-3.5 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={surgeHeavyRain} 
                        onChange={(e) => setSurgeHeavyRain(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white font-sans block">Inclement Heavy Rain (+40%)</strong>
                        <span className="text-[10px] text-slate-500">Unpaved Nsukka pathway mud wash.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-900 hover:bg-slate-900/85 border border-slate-800 p-3.5 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={surgeExamWeek} 
                        onChange={(e) => setSurgeExamWeek(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white font-sans block">Engineering Exam Week (+20%)</strong>
                        <span className="text-[10px] text-slate-500">Highest daily student urgency lock.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-900 hover:bg-slate-900/85 border border-slate-800 p-3.5 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={surgeWaterCrisis} 
                        onChange={(e) => setSurgeWaterCrisis(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      <div>
                        <strong className="text-white font-sans block">Dorm Water Crisis (+50%)</strong>
                        <span className="text-[10px] text-slate-500">Requires severe staircase haulage.</span>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Surcharge breakdown outcome */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mt-4 space-y-3 font-mono text-xs">
                  <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Dynamic Payout Split Structure:</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-[9.5px] text-slate-500 block">Total Escrow Collected</span>
                      <strong className="text-white text-base">₦{totalCalculatedFee}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-[9.5px] text-emerald-400 block">Released Runner Share (85%)</span>
                      <strong className="text-emerald-300 text-base">₦{runnerEarnings}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 col-span-2 md:col-span-1">
                      <span className="text-[9.5px] text-indigo-400 block">Platform Commission (15%)</span>
                      <strong className="text-indigo-300 text-base">₦{companyComissions}</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Batch Consolidation Simulator and Escrow safe indicators (5/12 Columns) */}
            <div className="col-span-1 lg:col-span-5 space-y-6">
              
              {/* Consolidation routes batch calculator */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold block">Proximity Math Simulator</span>
                  <h3 className="text-sm font-bold text-white uppercase font-mono mt-0.5">Route Batching Optimizer</h3>
                  <p className="text-xs text-slate-400 mt-1">See how bundling co-located orders (e.g., several wraps of Okpa from Chitis to Balewa Hall) saves users 30% while raising a runner&apos;s hour yield!</p>
                </div>

                <div className="space-y-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  {/* Co-located orders count input bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Co-located meals on route:</span>
                      <strong className="text-emerald-400 text-sm">{simulatedOkpaRequestsCount} orders</strong>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={simulatedOkpaRequestsCount} 
                      onChange={(e) => setSimulatedOkpaRequestsCount(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 mt-1"
                    />
                  </div>

                  {/* Calculations breakdown block */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-700/50 pt-2.5">
                    <div>
                      <span className="text-slate-500">Unbatched Baseline:</span>
                      <span className="block text-slate-300">₦{individualRunFee} / meal</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Batched Cost (-30%):</span>
                      <span className="block text-emerald-400 font-bold">₦{batchedRunFee} / meal</span>
                    </div>
                  </div>

                  <div className="bg-[#008751]/10 border border-emerald-800/30 p-3 rounded-lg text-xs leading-normal">
                    ⚡ <strong>Consolidated Runner Earning:</strong> Safe release pays runner <strong className="text-emerald-300 font-mono font-bold text-sm">₦{batchedRunnerEarning}</strong> in a single integrated loop! Requesters save 30% individually.
                  </div>
                </div>
              </div>

              {/* Digital Escrow Flow Safeguard info card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Trusted P2P Peer Handshake
                </span>
                <p className="text-[11.5px] text-slate-400 leading-relaxed font-mono">
                  1. Requester locks total payout in escrow contract.<br />
                  2. Dispatch bot approves matching runner.<br />
                  3. Runner purchases items with secure tracking.<br />
                  4. Photo handover verification triggers payouts!
                </p>
              </div>

            </div>

          </div>
        )}

        {/* SCREEN SECTION 5: PITCH SPECIFICATIONS & STRATEGY PLAYBOOK */}
        {activeTab === "playbook" && (
          <div className="bg-slate-950 border border-slate-800 rounded-[24px] p-5 md:p-8 space-y-8 shadow-xl">
            
            <div className="border-b border-slate-800 pb-5">
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-black">Strategic Product Specifications</span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Nsukka Venture Strategy Playbook</h2>
              <p className="text-xs text-slate-400 mt-1">An overview of campus microservice capture dynamics designed to capture high-density student micro-economies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">1. CORE STUDENT PROBLEMS SOLVED</h3>
                
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <strong className="text-emerald-400 block text-sm font-sans">The Extreme Time Poverty Trap</strong>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      University residents (especially engineering & computer science classes) face rigorous timetables and coursework overload. outsourcing tedious chores like manual line queuing at JGI paper stands or haulage stairs buys back critical revision blocks.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <strong className="text-sky-400 block text-sm font-sans">Low-Trust Dorm Environments</strong>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      High campus densities generate low-trust situations. Students avoid paying advances to strangers. Runs resolves this structural friction by clamping fees securely in a digital escrow handshake until delivery verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">2. LEAN PRODUCT MECHANIZATION (Manual Concierge Model)</h3>
                
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <strong className="text-amber-400 block text-xs font-mono uppercase tracking-wider">Early Launch Manual Concierge Architecture:</strong>
                    <p className="text-slate-400 text-xs mt-1 leading-normal">
                      Instead of commissioning expensive full-stack GPS real-time trackers immediately, Runs utilizes a WhatsApp manual intake pipeline. Users text local group threads, our Dispatch Bot utilizes Gemini LLM models to map coordinates, and releases verified alert nodes to veteed runner networks instantly.
                    </p>
                    <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-1 mt-2 font-mono">
                      <li><strong>Front-End Interface:</strong> Responsive PWA launcher.</li>
                      <li><strong>Intake Handler:</strong> WhatsApp Group alert logs parsing engine.</li>
                      <li><strong>Fulfillment Layer:</strong> Hostel-specific vouching trust networks.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono text-center">3. PERSISTENT ENTITIES SCHEMAS DESIGN</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="text-emerald-400 font-bold block mb-1">interface ErrandDetails</span>
                  <p className="text-slate-500">{"// maps run states"}</p>
                  <p>id: string;</p>
                  <p>category: ErrandCategory;</p>
                  <p>details: string;</p>
                  <p>sourceLocation: string;</p>
                  <p>destination: string;</p>
                  <p>payoutFee: number;</p>
                  <p>status: ErrandStatus;</p>
                  <p>activeRunnerID: string | null;</p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="text-indigo-400 font-bold block mb-1">interface StudentRunner</span>
                  <p className="text-slate-500">{"// vetted peer agents"}</p>
                  <p>id: string;</p>
                  <p>fullName: string;</p>
                  <p>vouchReferralRoom: string;</p>
                  <p>escrowSafetyBalance: number;</p>
                  <p>starRating: number; <span className="text-slate-500">{"// 1-5 Scale"}</span></p>
                  <p>completedJobs: number;</p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="text-amber-500 font-bold block mb-1">interface EscrowLedger</span>
                  <p className="text-slate-500">{"// audit ledger rows"}</p>
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
      <footer className="bg-slate-950 border-t border-slate-800 text-[11.5px] text-slate-500 font-mono py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>&copy; 2026 Runs Network. Tailored beautifully for Nsukka Campus high-density peer ecosystems.</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Fully Responsive Client
            </span>
            <span>•</span>
            <span>v0.1-Release</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

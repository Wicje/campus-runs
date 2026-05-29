# Runs Errand MVP 🦁
> **Engineering High-Density Campus Micro-Economies & Secure Peer-to-Peer Errand Logistics**

**Runs Errand MVP** is a robust, single-screen, highly polished Swiss-style systems launcher and product specification blueprint designed for high-density Nigerian university campuses like the **University of Nigeria, Nsukka (UNN)**. 

Students handle extreme "Time Poverty" from intensive academic workloads by outsourcing tedious chores—such as paper-binding lines at JGI, food haulage from Franco/Chitis, and staircase water hauling from Boreholes—to student runners. By mapping pickup-delivery vectors and utilizing a **Zero-Trust Digital Escrow Handshake**, Runs Errand MVP removes transaction friction, bypasses raw banking risks, and ensures student-to-student safety.

---

## 🎖️ Structural Architecture & Core Modules

The application is engineered into precise, responsive dashboard controls comprising five core functional sections:

### 1. **Adaugo Dispatch AI (Lioness Oracle)**
The central operational brain of the Runs network; an intelligent dispatch companion:
* **Live Route Optimization**: Advice on high-efficiency UNN hostel groupings (Franco, Slessor Hall, Bello, Balewa, Chitis).
* **WhatsApp Post Optimizer**: Formats messy, unstructured descriptions (e.g. *"print bio file at JGI, bring to Slessor Hall room 22 for 600 naira fast"*) into beautifully structured, high-engagement chat alert strings embedded with location tags and automated escrow validation codes.
* **Escrow Guarantee Calculations**: Deduces dynamic route adjustments and surcharges due to outage surges or bad weather conditions.

### 2. **Interactive Campus Map**
A schematic visual terminal depicting spatial vectors across UNN campus points:
* **Hostel Coordinates**: Tracks active pathways from major landmarks (Franco Dorms, Slessor Hall, Bello Dorm, Balewa, Eni-Njoku) to service points (Chitis Eatery, CEC Print Shop, JGI Business Center, and borehole hubs).
* **Path Hazard Feeds**: Showcases active campus conditions such as heavy rainstorms, borehole pump outages, or electricity downtime, enabling dynamic rate-surging predictions.

### 3. **Rate Assurance Matrices**
A fair-compensation index calibrated to local student pricing thresholds:
* **Franco & Chitis &rarr; Halls** *(Standard food haulage)*: **₦500 - ₦650**
* **CEC / JGI &rarr; Hostel Rooms** *(Document printing/binding)*: **₦600 - ₦800**
* **Borehole Station &rarr; High Dorm Floors** *(Water stair-hauling)*: **₦1,000 - ₦1,500** *(Surged during pumps electricity downtime)*

### 4. **Vetted Student Runner Registry**
A local directory representing audited student couriers currently active across the campus dormitories. Track completed rides, vouch room referrals, and monitor star-ratings (1.0 to 5.0 scale) to sustain high service standards.

### 5. **Venture Strategy Playbook**
Saves the master strategic model and system specification:
* **Academic Pain Index**: Analyzes Nsukka student workloads, time-poverty mechanics, and dormitory security conditions.
* **Lean Concierge Roadmap**: Outlines the transition from WhatsApp/manual courier dispatch logs to scalable automated peer contracts.
* **TypeScript Entity Model Schemas**: Documents strict data models defining the application's underlying ecosystem structure:
  ```typescript
  interface ErrandDetails {
    id: string;
    category: ErrandCategory;
    details: string;
    payoutNaira: number;
    status: ErrandStatus;
    activeRunnerID: string | null;
  }

  interface StudentRunner {
    id: string;
    fullName: string;
    vouchReferralRoom: string;
    starRating: number; // Scale: 1.0 - 5.0
    completedJobs: number;
  }

  interface EscrowLedger {
    jobIDReference: string;
    isCommissionCredited: boolean;
    isRunnerShareReleased: boolean;
    escrowStatus: "HOLDING" | "RELEASED" | "REFUNDED";
  }
  ```

---

## 🛠️ Technical Implementation Stack

* **Front-End & Router**: [Next.js 15+ App Router](https://nextjs.org/) utilizing standard Server/Client Component compilation structures.
* **Language Layer**: **TypeScript** (strictly typed enums, explicit interfaces, and no-any compiler assertions).
* **Styling Framework**: [Tailwind CSS v4](https://tailwindcss.com/) backed by `tw-animate-css` transitions.
* **Animations**: Motion API (`motion/react`) for smooth, micro-animated client interactions.
* **AI Engine**: Official [Google Gen AI SDK (`@google/genai`)](https://github.com/google/generative-ai-js) running server-side (`app/api/gemini/route.ts`) powered by the advanced model **Gemini 3.5 Flash** to safeguard operational keys.

---

## ⚙️ Development, Setup, & Execution

Follow these steps to configure and run the application locally or in a sandbox:

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (Version 18.x or 20.x recommended)
* `npm` or `yarn`

### 2. Dependency Installation
Initialize the local environment and download package configurations:
```bash
npm install
```

### 3. Environment Variable Configuration
Create a local `.env` file at the root of your project using the structured variables provided in `.env.example`:
```ini
# Required for Gemini AI API calls (Adaugo Dispatch System)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Reference URL where the client is hosted
APP_URL="http://localhost:3000"
```
> 💡 *Note: In Google AI Studio Build environments, these keys are securely injected at runtime from the settings console secrets.*

### 4. Running the Development Server
Initiate the live development server (configured to launch on port 3000):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser to test and view the interactive simulator.

### 5. Automated Validation & Quality Assurance
Run ESLint to verify syntactic compliance and clean type allocations:
```bash
npm run lint
```

### 6. Production Compiling & Building
Compile the application to generate production-ready static assets in the `.next` directory:
```bash
npm run build
```
Launch the compiled build:
```bash
npm run start
```

---

## 🛡️ Campus Safety Guidelines
1. **Always Use Digital Escrow**: Never transfer cash to runner bank accounts beforehand. Utilizing the system escrow ensures a digital handshake backed by photo handover proof.
2. **Double check Vouch referrals**: Only engage runners possessing active hostel room referents verified within the student registry.
3. **Contingency Surcharges**: When UNN infrastructure experiences downtime (borehole borehole pumps or JGI paper outages), confirm surge pricing via Adaugo to support workers against staircase hauling workloads.

---

*Engineered with 🦁 pride for Nigerian student workspaces.*

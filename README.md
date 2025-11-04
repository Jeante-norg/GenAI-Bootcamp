# High-Level Design (HLD)

## 1. Project Title

**CarbonKind – Document-Based Personal Carbon Footprint Tracker**

---

## 2. Problem Statement

People and small businesses struggle to understand their real carbon impact.  
Existing tools are generic or manual. **CarbonKind** simplifies this by allowing users to upload bills, receipts, or logs that the AI reads, interprets, and converts into a personalized carbon footprint with actionable suggestions.

---

## 3. Core Components

- **UI:** Web app for uploads, chat, and visual summaries.
- **LLM API:** GPT-4 or Llama 3 for document understanding and contextual reasoning.
- **Tools (Function Calling):**
  1. `extractEmissionData()` – reads values from files.
  2. `calculateFootprint()` – computes CO₂e using emission factors.
  3. `suggestReductions()` – recommends ways to reduce emissions.

---

## 4. LLM’s Primary Task

To act as a **personal sustainability agent**: understand documents, retrieve accurate emission data, calculate footprints, and give clear, data-driven advice.

---

## 5. Inputs and Outputs

- **Input:** Bills, receipts, or logs (PDF/text/image).
- **Output:** CO₂e by category, top impact areas, and suggested reductions.

---

## 6. Expected Outcome

A personalized, automated tool that translates everyday data into measurable carbon insights and encourages real behavioral change.

---

## 7. System Overview

```
User Upload → Backend → LLM Agent
     ↓             ↓
 Document Parser   → Function Calls
     ↓             ↓
 RAG (Emission Factors DB)
     ↓
 Simplified Results + Suggestions
```

---

## 8. Key GenAI Concepts

| Concept                | Implementation                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Prompt Engineering** | Prompts designed for structured extraction of emission-related data and consistent tone. |
| **RAG**                | Vector DB (Chroma/FAISS) storing verified emission factors retrieved during analysis.    |
| **Function Calling**   | LLM calls custom tools to parse, calculate, and suggest.                                 |
| **ReAct Agent**        | Plans: _Parse → Retrieve → Compute → Explain_; executes reasoning loop autonomously.     |

---

## 9. Example Use

**User:** “Here’s my electricity bill—how much CO₂ did I emit?”  
**Agent:** Extracts 180 kWh → retrieves factor (0.82 kg CO₂/kWh) → outputs ≈148 kg CO₂e → suggests switching to LED and off-peak usage.

---

Deployed Link: https://gen-ai-bootcamp-ashen.vercel.app/

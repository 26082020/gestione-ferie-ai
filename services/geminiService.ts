import { GoogleGenAI } from "@google/genai";
import { LeaveRequest, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScheduleConflicts = async (
  requests: LeaveRequest[],
  users: User[]
): Promise<string> => {
  try {
    // Filter for only active requests (Approved or Pending)
    const activeRequests = requests.filter(
      (r) => r.status === "Approvato" || r.status === "In Attesa"
    );

    // Create a simplified data structure for the AI
    const scheduleData = activeRequests.map((req) => {
      const user = users.find((u) => u.id === req.userId);
      return {
        employee: user?.name,
        department: user?.department,
        start: req.startDate,
        end: req.endDate,
        status: req.status,
      };
    });

    const prompt = `
      Sei un assistente HR intelligente. Analizza i seguenti dati sulle ferie dei dipendenti.
      Identifica potenziali conflitti (troppe persone dello stesso dipartimento assenti contemporaneamente) 
      o periodi critici. Sii conciso, professionale e utile. Parla in italiano.
      
      Dati:
      ${JSON.stringify(scheduleData, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Impossibile generare l'analisi al momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Si è verificato un errore durante l'analisi AI del calendario.";
  }
};
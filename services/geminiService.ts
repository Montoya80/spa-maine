
import { GoogleGenAI, Type } from "@google/genai";
import { Patient, TreatmentSuggestion } from "../types";

// Initialize Gemini
// NOTE: In a real production app, ensure API keys are handled securely via environment variables.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey });

const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Desconocida';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Mock Suggestion Generator for Demo Mode or Fallback
const getMockSuggestion = (patient: Patient, concern: string): TreatmentSuggestion => {
    console.warn("⚠️ Usando Modo Demo (API Key no configurada o falló).");
    
    const skinType = patient.skinType || 'General';
    const age = calculateAge(patient.birthDate);
    
    return {
        plan: `[MODO DEMO - IA NO CONECTADA]\n\nBasado en el perfil (${age} años, Piel ${skinType}) y la preocupación "${concern}", sugerimos:\n\n1. Limpieza profunda con activos calmantes.\n2. Aplicación de suero hidratante con Ácido Hialurónico.\n3. Masaje drenante linfático facial.\n4. Fototerapia LED (Luz Azul/Roja) por 20 min.\n\nEste protocolo busca equilibrar la barrera cutánea y reducir la inflamación localizada.`,
        products: [
            "Limpiador Syndet pH 5.5",
            "Niacinamida 10%",
            "Ácido Hialurónico de bajo peso molecular",
            "Protector Solar FPS 50+ Toque Seco"
        ],
        lifestyleAdvice: "Aumentar la ingesta de agua a 2.5L diarios. Evitar lavar el rostro con agua muy caliente. Cambiar la funda de la almohada cada 3 días."
    };
};

export const generateTreatmentSuggestion = async (
  patient: Patient,
  currentConcern: string
): Promise<TreatmentSuggestion | null> => {
  
  // 1. Check if Key exists. If not, use Mock immediately.
  if (!apiKey || apiKey.includes('tu_clave') || apiKey.length < 10) {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      return getMockSuggestion(patient, currentConcern);
  }

  const age = calculateAge(patient.birthDate);

  try {
    const prompt = `
      Actúa como un dermatólogo experto y especialista en estética.
      Analiza el siguiente perfil de paciente y genera una sugerencia de tratamiento breve y profesional.
      
      Datos del Paciente:
      - Edad: ${age}
      - Tipo de Piel: ${patient.skinType}
      - Alergias: ${patient.allergies}
      - Preocupación actual/Notas: ${currentConcern}
      
      Provee un plan de tratamiento, productos sugeridos (ingredientes activos), y consejos de estilo de vida.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: { type: Type.STRING, description: "Detailed treatment steps" },
            products: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of recommended active ingredients or products" 
            },
            lifestyleAdvice: { type: Type.STRING, description: "Short advice for home care" }
          },
          required: ["plan", "products", "lifestyleAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text) as TreatmentSuggestion;

  } catch (error: any) {
    console.error("Error creating suggestion:", error);
    
    // Fallback to Mock Data on API Failure instead of crashing
    if (error.message?.includes("API not enabled") || error.toString().includes("API not enabled") || error.status === 403 || error.status === 400) {
        return getMockSuggestion(patient, currentConcern);
    }
    
    throw error;
  }
};

import { GoogleGenAI } from "@google/genai";
import { Project, ProjectStatus } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeProjectRisk = async (project: Project): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';

    const prompt = `
      Analyze the following construction project status and provide a brief risk assessment (max 150 words).
      Focus on the timeline (Target vs Actual/Current Date), accomplishment percentage, and status.
      Identify if the project is delayed, on track, or ahead, and suggest 1 key action item.
      
      Project Data:
      - Project: ${project.projectName}
      - Allocation: ${project.projectAllocation}
      - Target Completion: ${project.targetCompletionDate}
      - Current Status: ${project.status}
      - Accomplishment: ${project.accomplishmentPercentage}%
      - Remarks: ${project.otherRemarks || 'None'}
      - Today's Date: ${new Date().toISOString().split('T')[0]}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Error analyzing project:", error);
    return "Unable to perform AI analysis at this time. Please check your API key.";
  }
};

export const generateSmartRemarks = async (project: Project): Promise<string> => {
    try {
        const ai = getClient();
        const model = 'gemini-2.5-flash';
        const prompt = `
          Generate a concise, professional "Other Remarks" update for a construction project report based on this data:
          Status: ${project.status}
          Accomplishment: ${project.accomplishmentPercentage}%
          Target Date: ${project.targetCompletionDate}
          
          Keep it under 20 words.
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text?.trim() || "";
    } catch (error) {
        return "";
    }
}

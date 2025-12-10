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

export const generateRegionalReport = async (region: string, projects: Project[]): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    // Prepare a simplified data set for the prompt to save tokens
    const projectSummaries = projects.map(p => ({
      name: p.schoolName,
      status: p.status,
      progress: p.accomplishmentPercentage,
      allocation: p.projectAllocation,
      targetDate: p.targetCompletionDate
    }));

    const prompt = `
      Act as a Regional Infrastructure Manager. Generate a formal Executive Summary Report for **${region}**.
      
      Data Provided:
      ${JSON.stringify(projectSummaries)}
      
      Report Structure:
      1. **Executive Overview**: Total projects, total budget (sum allocation), and general progress sentiment.
      2. **Status Breakdown**: Count of projects by status (Completed, Ongoing, Delayed).
      3. **Critical Attention Required**: Identify specific schools with low progress (<20%) or that are delayed past target date.
      4. **Recommendations**: 2-3 strategic actions to improve implementation in this region.
      
      Format: Use Markdown. Be professional, concise, and data-driven.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Unable to generate report at this time. Please check your API key.";
  }
};
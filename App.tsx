import React, { useState, useCallback } from 'react';
import { Project } from './types';
import { MOCK_PROJECTS } from './constants';
import ProjectTable from './components/ProjectTable';
import EditProjectModal from './components/EditProjectModal';
import DashboardStats from './components/DashboardStats';
import AIInsightModal from './components/AIInsightModal';
import { analyzeProjectRisk } from './services/geminiService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // AI Modal State
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [insightText, setInsightText] = useState("");
  const [analyzingProjectName, setAnalyzingProjectName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleEditClick = useCallback((project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveProject = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }, []);

  const handleAnalyzeClick = useCallback(async (project: Project) => {
      setAnalyzingProjectName(project.projectName);
      setInsightModalOpen(true);
      setIsAnalyzing(true);
      
      const result = await analyzeProjectRisk(project);
      
      setInsightText(result);
      setIsAnalyzing(false);
  }, []);

  const handleCloseInsight = () => {
      setInsightModalOpen(false);
      setInsightText("");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-lg">
              IE
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">InsightEd <span className="text-slate-400 font-normal text-sm ml-2 hidden sm:inline-block">School Infrastructure Monitoring</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-sm text-slate-500 hidden md:block">
                 Logged in as <span className="font-semibold text-slate-800">Admin</span>
             </div>
             <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm">
                 + New Project
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Stats Section */}
        <DashboardStats projects={projects} />

        {/* Filters & Actions (Placeholder for now) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="relative w-full sm:w-96">
                <input 
                    type="text" 
                    placeholder="Search schools or projects..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </div>
            <div className="flex gap-2">
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Statuses</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                </select>
            </div>
        </div>

        {/* Table Section */}
        <ProjectTable 
            projects={projects} 
            onEdit={handleEditClick}
            onAnalyze={handleAnalyzeClick}
        />
      </main>

      {/* Modals */}
      <EditProjectModal 
        project={editingProject} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveProject} 
      />

      <AIInsightModal
        isOpen={insightModalOpen}
        onClose={handleCloseInsight}
        analysis={insightText}
        projectName={analyzingProjectName}
        isLoading={isAnalyzing}
      />
    </div>
  );
};

export default App;
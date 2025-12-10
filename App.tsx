import React, { useState, useCallback } from 'react';
import { Project, ProjectStatus } from './types';
import { MOCK_PROJECTS } from './constants';
import ProjectTable from './components/ProjectTable';
import EditProjectModal from './components/EditProjectModal';
import DashboardStats from './components/DashboardStats';
import AIInsightModal from './components/AIInsightModal';
import ReportGeneratorModal from './components/ReportGeneratorModal';
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

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleEditClick = useCallback((project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  }, []);

  const handleNewProjectClick = () => {
    setEditingProject(null); // Set to null for new project
    setIsEditModalOpen(true);
  };

  const handleRealignClick = useCallback((project: Project) => {
    const realignedProject: Project = {
        ...project,
        id: '', // Empty ID ensures it's treated as a new entry
        // Reset Basic Info
        region: '',
        division: '',
        barangay: '',
        schoolId: '',
        schoolName: '',
        projectName: '',
        projectId: '',
        // Reset Status & Progress
        status: ProjectStatus.NotYetStarted,
        accomplishmentPercentage: 0,
        statusAsOfDate: new Date().toISOString().split('T')[0],
        // Reset Tracking
        actualCompletionDate: undefined,
        coordinates: undefined,
        photos: [],
        documents: [],
        certificateUrl: undefined,
        // Keep Allocation, Year, Batch, Contract info, Contractor, Timelines
    };
    setEditingProject(realignedProject);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveProject = useCallback((updatedProject: Project) => {
    setProjects(prev => {
      if (updatedProject.id) {
        // Update existing
        return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      } else {
        // Create new
        const newProject = {
            ...updatedProject,
            id: Math.random().toString(36).substr(2, 9) // Simple ID generation
        };
        return [newProject, ...prev];
      }
    });
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

  const handleExportCSV = () => {
    // Define columns, ensuring location fields are separated
    const headers = [
        "Region", "Division", "Barangay", 
        "School Name", "School ID", "Project Name", "Project ID",
        "Status", "Accomplishment (%)", "Allocation", "Batch", "Year",
        "Contractor", "Contract ID",
        "Target Date", "Actual Date",
        "Invitation to Bid", "Notice to Proceed",
        "Lat", "Lng",
        "Other Remarks"
    ];

    const csvContent = [
        headers.join(","),
        ...projects.map(p => {
            const row = [
                p.region, p.division, p.barangay,
                p.schoolName, p.schoolId, p.projectName, p.projectId,
                p.status, p.accomplishmentPercentage, p.projectAllocation, p.batchOfFunds, p.year,
                p.contractorName, p.contractId,
                p.targetCompletionDate, p.actualCompletionDate || '',
                p.invitationToBid || '', p.noticeToProceed || '',
                p.coordinates?.lat || '', p.coordinates?.lng || '',
                p.otherRemarks || ''
            ];
            
            return row.map(field => {
                const stringField = String(field ?? '');
                // Escape quotes and handle commas
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            }).join(",");
        })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `InsightEd_Projects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
             
             <button 
                onClick={() => setReportModalOpen(true)}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                 </svg>
                 Generate Report
             </button>
             <button 
                onClick={handleNewProjectClick}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
             >
                 + New Project
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Stats Section */}
        <DashboardStats projects={projects} />

        {/* Filters & Actions */}
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
                <button 
                    onClick={handleExportCSV}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Export CSV
                </button>
            </div>
        </div>

        {/* Table Section */}
        <ProjectTable 
            projects={projects} 
            onEdit={handleEditClick}
            onRealign={handleRealignClick}
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

      <ReportGeneratorModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        projects={projects}
      />
    </div>
  );
};

export default App;
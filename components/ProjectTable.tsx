import React from 'react';
import { Project, ProjectStatus } from '../types';

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onAnalyze: (project: Project) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onEdit, onAnalyze }) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Completed: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ProjectStatus.Ongoing: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ProjectStatus.NotYetStarted: return 'bg-slate-100 text-slate-800 border-slate-200';
      case ProjectStatus.UnderProcurement: return 'bg-amber-100 text-amber-800 border-amber-200';
      case ProjectStatus.ForFinalInspection: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  // Define column structure for cleaner rendering
  const columns = [
    { header: 'Project Details', width: 'min-w-[250px]', fixed: true },
    { header: 'Location', width: 'min-w-[200px]' },
    { header: 'Status', width: 'min-w-[150px]' },
    { header: 'Accomplishment', width: 'min-w-[150px]' },
    { header: 'Allocation', width: 'min-w-[150px]' },
    { header: 'Contractor', width: 'min-w-[200px]' },
    { header: 'Target Date', width: 'min-w-[120px]' },
    { header: 'Actual Date', width: 'min-w-[120px]' },
    { header: 'Remarks', width: 'min-w-[200px]' },
    { header: 'Batch', width: 'min-w-[100px]' },
    { header: 'IDs', width: 'min-w-[150px]' },
    { header: 'Procurement Dates', width: 'min-w-[250px]' },
    { header: 'Actions', width: 'min-w-[150px]', right: true }
  ];

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 flex flex-col h-[600px] overflow-hidden">
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm text-xs uppercase font-semibold text-slate-500">
            <tr>
              {/* Sticky Left Column */}
              <th className="sticky left-0 bg-slate-50 z-30 p-4 border-b border-r border-slate-200 min-w-[250px]">Project Info</th>
              
              <th className="p-4 border-b border-slate-200 min-w-[180px]">Location</th>
              <th className="p-4 border-b border-slate-200 min-w-[200px]">Status / Progress</th>
              <th className="p-4 border-b border-slate-200 min-w-[150px]">Allocation</th>
              <th className="p-4 border-b border-slate-200 min-w-[200px]">Contractor</th>
              <th className="p-4 border-b border-slate-200 min-w-[150px]">Dates (Target/Actual)</th>
              <th className="p-4 border-b border-slate-200 min-w-[200px]">Remarks</th>
              <th className="p-4 border-b border-slate-200 min-w-[250px]">Procurement Details</th>
              
              {/* Sticky Right Column */}
              <th className="sticky right-0 bg-slate-50 z-30 p-4 border-b border-l border-slate-200 min-w-[140px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                {/* Sticky Left Content */}
                <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 p-4 border-r border-slate-200 align-top">
                  <div className="font-bold text-blue-600 mb-1">{project.schoolName}</div>
                  <div className="text-xs text-slate-500 mb-2">{project.projectName}</div>
                  <div className="text-xs font-mono bg-slate-100 inline-block px-1 rounded text-slate-500">
                    ID: {project.schoolId}
                  </div>
                </td>

                <td className="p-4 align-top">
                  <div className="font-medium">{project.division}</div>
                  <div className="text-xs text-slate-500">{project.barangay}, {project.region}</div>
                </td>

                <td className="p-4 align-top">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)} mb-2`}>
                    {project.status}
                  </span>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                    <div 
                        className={`h-2.5 rounded-full ${project.accomplishmentPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                        style={{ width: `${project.accomplishmentPercentage}%` }}></div>
                  </div>
                  <div className="text-xs text-right mt-1 font-mono text-slate-500">{project.accomplishmentPercentage}%</div>
                </td>

                <td className="p-4 align-top font-mono text-slate-700">
                  {formatCurrency(project.projectAllocation)}
                  <div className="text-xs text-slate-400 mt-1">{project.batchOfFunds}</div>
                </td>

                <td className="p-4 align-top">
                  <div className="font-medium">{project.contractorName}</div>
                  <div className="text-xs text-slate-400 mt-1">Contract: {project.contractId}</div>
                </td>

                <td className="p-4 align-top space-y-1">
                  <div className="text-xs">
                    <span className="text-slate-400">Target:</span> <span className="font-medium">{project.targetCompletionDate}</span>
                  </div>
                  {project.actualCompletionDate && (
                    <div className="text-xs">
                      <span className="text-slate-400">Actual:</span> <span className="text-emerald-600 font-medium">{project.actualCompletionDate}</span>
                    </div>
                  )}
                   <div className="text-xs">
                      <span className="text-slate-400">As Of:</span> <span className="text-slate-600">{project.statusAsOfDate}</span>
                    </div>
                </td>

                <td className="p-4 align-top text-xs text-slate-600 italic">
                  {project.otherRemarks || "No remarks"}
                </td>

                <td className="p-4 align-top text-xs space-y-1">
                   <div><span className="text-slate-400">ITB:</span> {project.invitationToBid || '-'}</div>
                   <div><span className="text-slate-400">NTP:</span> {project.noticeToProceed || '-'}</div>
                   <div><span className="text-slate-400">RTA:</span> {project.resolutionToAward || '-'}</div>
                </td>

                {/* Sticky Right Content */}
                <td className="sticky right-0 bg-white group-hover:bg-slate-50 z-10 p-4 border-l border-slate-200 align-top text-center space-y-2">
                  <button 
                    onClick={() => onEdit(project)}
                    className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition shadow-sm"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => onAnalyze(project)}
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 text-purple-600 text-xs font-medium rounded hover:bg-purple-50 transition flex items-center justify-center gap-1"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M10 2a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 2zM5.5 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 015.5 8zM14.5 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0114.5 8z" />
                     </svg>
                    Risk Check
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
                <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                        No projects found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;

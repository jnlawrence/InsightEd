import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { generateSmartRemarks } from '../services/geminiService';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Project | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [realignMode, setRealignMode] = useState(false);

  // Default empty state for new project
  const emptyProject: Project = {
    id: '',
    region: '',
    division: '',
    barangay: '',
    schoolId: '',
    schoolName: '',
    projectName: '',
    year: new Date().getFullYear(),
    batchOfFunds: '',
    projectAllocation: 0,
    targetCompletionDate: '',
    actualCompletionDate: '',
    projectId: '',
    contractId: '',
    invitationToBid: '',
    preSubmissionConference: '',
    bidOpening: '',
    resolutionToAward: '',
    noticeToProceed: '',
    contractorName: '',
    otherRemarks: '',
    statusAsOfDate: new Date().toISOString().split('T')[0],
    accomplishmentPercentage: 0,
    status: ProjectStatus.NotYetStarted,
    photos: [],
    documents: [],
    certificateUrl: '',
  };

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({ ...project });
        setRealignMode(false);
      } else {
        setFormData({ ...emptyProject });
        setRealignMode(false);
      }
    }
  }, [isOpen, project]);

  if (!isOpen || !formData) return null;

  // --- Logic for Modes ---
  const isCompleted = formData.status === ProjectStatus.Completed;
  const isOngoingOrFinal = formData.status === ProjectStatus.Ongoing || formData.status === ProjectStatus.ForFinalInspection;
  const isPreConstruction = formData.status === ProjectStatus.UnderProcurement || formData.status === ProjectStatus.NotYetStarted;

  // Visibility Logic
  // "If project status is 'Under Procurement' and 'Not Yet Started' the only show Timelines, and Contract & Funds."
  // Assuming Basic Info is ALWAYS needed to identify the project.
  const showTimelines = true;
  const showContract = true;
  
  // Show accomplishment if Ongoing, Final Inspection or Completed
  const showAccomplishment = isOngoingOrFinal || isCompleted;
  
  // Show Extras (Photos, Files, Location) if Ongoing or Final Inspection
  const showOngoingExtras = isOngoingOrFinal;
  
  // Show Completion Extras (Actual Date, Cert, Location) if Completed
  const showCompletionExtras = isCompleted;

  // Read-only Logic
  // "If the status is 'Ongoing' and 'For Final Inspection...', show timelines and Contract & Funds but make it grayed out and uneditable."
  // "If 'Completed', show all fields but make it uneditable."
  const basicInfoReadOnly = isCompleted && !realignMode;
  const timelinesReadOnly = isOngoingOrFinal || isCompleted;
  const contractReadOnly = isOngoingOrFinal || isCompleted;
  const accomplishmentReadOnly = isCompleted;

  // -----------------------

  const handleRealign = () => {
    if (!formData) return;
    setFormData({
        ...formData,
        id: '', // Reset ID to create new
        // Clear Basic Info
        region: '',
        division: '',
        barangay: '',
        schoolId: '',
        schoolName: '',
        projectName: '',
        projectId: '',
        // Reset Progress
        status: ProjectStatus.NotYetStarted,
        accomplishmentPercentage: 0,
        statusAsOfDate: new Date().toISOString().split('T')[0],
        // Reset Outputs
        photos: [],
        documents: [],
        coordinates: undefined,
        actualCompletionDate: '',
        certificateUrl: '',
    });
    setRealignMode(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: parseFloat(value) || 0 } : null);
  };

  const handleGenerateRemarks = async () => {
      if(!formData) return;
      setIsGenerating(true);
      const remark = await generateSmartRemarks(formData);
      if(remark) {
          setFormData(prev => prev ? { ...prev, otherRemarks: remark } : null);
      }
      setIsGenerating(false);
  }

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => prev ? {
          ...prev,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
        } : null);
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve location. Please check your permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photos' | 'documents') => {
      if (e.target.files && e.target.files.length > 0) {
          const fileNames = Array.from(e.target.files).map((f: any) => f.name);
          setFormData(prev => {
              if (!prev) return null;
              const current = prev[field] || [];
              return { ...prev, [field]: [...current, ...fileNames] };
          });
      }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const fileName = e.target.files[0].name;
          setFormData(prev => prev ? { ...prev, certificateUrl: fileName } : null);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const isNewProject = !project || project.id === '' || realignMode;
  const isExistingProject = project && project.id !== '' && !realignMode;

  const InputField = ({ label, name, type = "text", value, onChange, readOnly, required = false }: any) => (
      <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
          <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            disabled={readOnly}
            required={required}
            className={`w-full border rounded px-3 py-2 text-sm ${readOnly ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300'}`} 
          />
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-20">
          <h2 className="text-xl font-bold text-slate-800">
            {realignMode ? 'Realign Project' : (isNewProject ? 'Create New Project' : 'Update Project')}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Realign Button - First Button in Update Tab */}
          {isExistingProject && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Need to Realign?</h4>
                    <p className="text-xs text-amber-700 mt-1">This will create a new project entry retaining the funding/contract details but resetting the location and basic info.</p>
                </div>
                <button 
                    type="button"
                    onClick={handleRealign}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600 shadow-sm transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    Realign Project
                </button>
            </div>
          )}

          {/* Status Selection - Top Priority */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <label className="block text-sm font-bold text-slate-800 mb-2">Current Project Status</label>
             <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full border border-blue-300 rounded px-4 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
             >
                {Object.values(ProjectStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
             </select>
             <p className="text-xs text-slate-500 mt-2">
                 Changing the status will unlock/lock specific fields relevant to that phase.
             </p>
          </div>

          {/* Basic Info */}
          <div>
            <div className="pb-2 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                    Basic Information
                    {realignMode && <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 normal-case font-normal">(Please enter new location details)</span>}
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Region" name="region" value={formData.region} onChange={handleChange} readOnly={basicInfoReadOnly} required />
                <InputField label="Division" name="division" value={formData.division} onChange={handleChange} readOnly={basicInfoReadOnly} />
                <InputField label="School Name" name="schoolName" value={formData.schoolName} onChange={handleChange} readOnly={basicInfoReadOnly} required />
                <InputField label="School ID" name="schoolId" value={formData.schoolId} onChange={handleChange} readOnly={basicInfoReadOnly} />
                <InputField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} readOnly={basicInfoReadOnly} required />
                <InputField label="Project ID" name="projectId" value={formData.projectId} onChange={handleChange} readOnly={basicInfoReadOnly} />
            </div>
          </div>

          {/* Timelines */}
          {showTimelines && (
              <div>
                <div className="pb-2 border-b border-slate-100 mb-4 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        Timelines (Procurement & Construction)
                        {timelinesReadOnly && <span className="ml-2 text-xs text-slate-400 normal-case font-normal">(Read Only)</span>}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField type="date" label="Invitation to Bid" name="invitationToBid" value={formData.invitationToBid || ''} onChange={handleChange} readOnly={timelinesReadOnly} />
                    <InputField type="date" label="Pre-Submission Conf." name="preSubmissionConference" value={formData.preSubmissionConference || ''} onChange={handleChange} readOnly={timelinesReadOnly} />
                    <InputField type="date" label="Bid Opening" name="bidOpening" value={formData.bidOpening || ''} onChange={handleChange} readOnly={timelinesReadOnly} />
                    <InputField type="date" label="Resolution to Award" name="resolutionToAward" value={formData.resolutionToAward || ''} onChange={handleChange} readOnly={timelinesReadOnly} />
                    <InputField type="date" label="Notice To Proceed" name="noticeToProceed" value={formData.noticeToProceed || ''} onChange={handleChange} readOnly={timelinesReadOnly} />
                    <InputField type="date" label="Target Completion" name="targetCompletionDate" value={formData.targetCompletionDate} onChange={handleChange} readOnly={timelinesReadOnly} />
                </div>
              </div>
          )}
          
          {/* Contract & Funds */}
          {showContract && (
            <div>
                <div className="pb-2 border-b border-slate-100 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        Contract & Funds
                        {contractReadOnly && <span className="ml-2 text-xs text-slate-400 normal-case font-normal">(Read Only)</span>}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField label="Contractor" name="contractorName" value={formData.contractorName} onChange={handleChange} readOnly={contractReadOnly} />
                    <InputField label="Contract ID" name="contractId" value={formData.contractId} onChange={handleChange} readOnly={contractReadOnly} />
                    <InputField type="number" label="Project Allocation" name="projectAllocation" value={formData.projectAllocation} onChange={handleNumberChange} readOnly={contractReadOnly} />
                    <InputField label="Batch of Funds" name="batchOfFunds" value={formData.batchOfFunds} onChange={handleChange} readOnly={contractReadOnly} />
                    <InputField type="number" label="Year" name="year" value={formData.year} onChange={handleNumberChange} readOnly={contractReadOnly} />
                </div>
            </div>
          )}

          {/* Accomplishment */}
          {showAccomplishment && (
            <div>
                 <div className="pb-2 border-b border-slate-100 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        Physical Accomplishment
                        {accomplishmentReadOnly && <span className="ml-2 text-xs text-slate-400 normal-case font-normal">(Read Only)</span>}
                    </h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField 
                        type="number" 
                        label="Accomplishment (%)" 
                        name="accomplishmentPercentage" 
                        value={formData.accomplishmentPercentage} 
                        onChange={handleNumberChange} 
                        readOnly={accomplishmentReadOnly}
                    />
                    <InputField 
                        type="date" 
                        label="Status As Of" 
                        name="statusAsOfDate" 
                        value={formData.statusAsOfDate} 
                        onChange={handleChange} 
                        readOnly={accomplishmentReadOnly}
                    />
                 </div>
            </div>
          )}

          {/* New: Ongoing Extras (Photos, Files, Location) */}
          {showOngoingExtras && (
             <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Site Updates & Evidence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Upload Site Photos</label>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-white border border-slate-300 rounded px-4 py-2 text-sm hover:bg-slate-50 shadow-sm transition-colors">
                                Choose Photos
                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'photos')} />
                            </label>
                            <span className="text-xs text-slate-500">{formData.photos?.length || 0} files selected</span>
                        </div>
                        {formData.photos && formData.photos.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600">
                                {formData.photos.map((f, i) => <div key={i}>📸 {f}</div>)}
                            </div>
                        )}
                    </div>
                    {/* Documents */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Upload Project Files</label>
                         <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-white border border-slate-300 rounded px-4 py-2 text-sm hover:bg-slate-50 shadow-sm transition-colors">
                                Choose Files
                                <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'documents')} />
                            </label>
                            <span className="text-xs text-slate-500">{formData.documents?.length || 0} files selected</span>
                        </div>
                        {formData.documents && formData.documents.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600">
                                {formData.documents.map((f, i) => <div key={i}>📎 {f}</div>)}
                            </div>
                        )}
                    </div>
                     {/* Geolocation */}
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Site Location Check-in</label>
                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={handleCaptureLocation}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition"
                            >
                                {isLocating ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                )}
                                Capture Coordinates
                            </button>
                            {formData.coordinates ? (
                                <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
                                    <strong>Captured:</strong> {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                                    <br />
                                    <span className="text-slate-500">Accuracy: {formData.coordinates.accuracy.toFixed(1)}m</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-500">No coordinates captured yet.</span>
                            )}
                        </div>
                     </div>
                </div>
             </div>
          )}

          {/* New: Completion Extras */}
          {showCompletionExtras && (
              <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Project Completion Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        type="date" 
                        label="Actual Date of Completion" 
                        name="actualCompletionDate" 
                        value={formData.actualCompletionDate || ''} 
                        onChange={handleChange} 
                    />
                    
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Certificate of Completion</label>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-white border border-slate-300 rounded px-4 py-2 text-sm hover:bg-slate-50 shadow-sm transition-colors">
                                Upload Certificate
                                <input type="file" className="hidden" onChange={handleCertUpload} />
                            </label>
                            <span className="text-xs text-slate-500">{formData.certificateUrl || 'No file selected'}</span>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700 mb-1">Final Inspection Location</label>
                         <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={handleCaptureLocation}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition"
                            >
                                {isLocating ? (
                                     <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                )}
                                Verify Location
                            </button>
                            {formData.coordinates ? (
                                <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
                                    <strong>Verified:</strong> {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                                    <br />
                                    <span className="text-slate-500">Accuracy: {formData.coordinates.accuracy.toFixed(1)}m</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-500">No location data.</span>
                            )}
                        </div>
                    </div>
                </div>
              </div>
          )}

          {/* Remarks (Always visible/editable mostly, but usually part of update) */}
          <div className="pt-2 border-t border-slate-100">
             <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-slate-700">Other Remarks</label>
                 <button 
                    type="button" 
                    onClick={handleGenerateRemarks}
                    disabled={isGenerating}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                 >
                     {isGenerating ? (
                         <span className="animate-pulse">Generating...</span>
                     ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6 20.25a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm17.625-2.625a.75.75 0 00-1.061 0l-.75.75a.75.75 0 101.06 1.06l.75-.75a.75.75 0 000-1.06zm-17.625-15a.75.75 0 000 1.061l.75.75a.75.75 0 001.061-1.06l-.75-.75a.75.75 0 00-1.061 0z" clipRule="evenodd" />
                            </svg>
                            Auto-Generate with AI
                         </>
                     )}
                 </button>
             </div>
             <textarea name="otherRemarks" value={formData.otherRemarks || ''} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2 text-sm" />
          </div>

        </form>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            {realignMode ? 'Create Realigned Project' : (isNewProject ? 'Create Project' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardStatsProps {
  projects: Project[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ projects }) => {
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === ProjectStatus.Completed).length,
    ongoing: projects.filter(p => p.status === ProjectStatus.Ongoing).length,
    delayed: projects.filter(p => {
       if (p.status === ProjectStatus.Completed) return false;
       const target = new Date(p.targetCompletionDate);
       const now = new Date();
       return now > target && p.accomplishmentPercentage < 100;
    }).length,
    totalAllocation: projects.reduce((acc, curr) => acc + curr.projectAllocation, 0)
  };

  const data = [
    { name: 'Completed', value: stats.completed, color: '#10B981' }, // Emerald 500
    { name: 'Ongoing', value: stats.ongoing, color: '#3B82F6' }, // Blue 500
    { name: 'Delayed', value: stats.delayed, color: '#EF4444' }, // Red 500
    { name: 'Others', value: stats.total - (stats.completed + stats.ongoing + stats.delayed), color: '#94A3B8' } // Slate 400
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">Total Projects</p>
        <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">Total Allocation</p>
        <p className="text-3xl font-bold text-slate-800">
          ₱{(stats.totalAllocation / 1000000).toFixed(2)}M
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">Delayed Projects</p>
        <p className={`text-3xl font-bold ${stats.delayed > 0 ? 'text-red-500' : 'text-slate-800'}`}>
          {stats.delayed}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
         <div className="w-full h-24">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
         </div>
         <div className="text-xs text-slate-500 space-y-1">
             {data.map(d => (
                 <div key={d.name} className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></span>
                     <span>{d.name}</span>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};

export default DashboardStats;

import { RefreshCw } from "lucide-react";

export default function AppStatsCard({ title, count, icon: Icon, color, bgColor }) {
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            {loading && (
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
            )}
        </div>
      
        <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            {title}
            </h3>
            <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">
                    {loading ? '--' : count}
                </span>
                <span className="text-sm text-gray-500">transferts</span>
            </div>
        </div>
      
        {/* Indicateur d'activité */}
        <div className="mt-3 flex items-center">
            <div className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span className="text-xs text-gray-500">
                {count > 0 ? 'Actif' : 'Inactif'}
            </span>
        </div>
    </div>
}
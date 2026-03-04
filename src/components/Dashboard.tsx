import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Recycle,
  Search,
  Camera,
  Info,
  Star,
  RefreshCw,
  ChevronRight,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  history: any[];
  user: any;
  onRefresh?: () => void;
  onItemClick?: (itemName: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, user: initialUser, onRefresh, onItemClick }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    const token = localStorage.getItem('eco_token');
    if (!token) {
      setLoadingProfile(false);
      return;
    }
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        // Session invalid or user deleted, logout
        localStorage.removeItem('eco_token');
        localStorage.removeItem('eco_user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const tips = [
    "Did you know? Recycling one aluminum can saves enough energy to run a TV for three hours.",
    "Plastic bottles can take up to 450 years to decompose in a landfill.",
    "Glass is 100% recyclable and can be recycled endlessly without loss in quality.",
    "Paper can be recycled up to 7 times before the fibers become too short."
  ];
  const [currentTip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-eco-100 rounded-2xl flex items-center justify-center text-eco-600">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-stone-900">
              {profile?.email || initialUser?.email}
            </h2>
            <p className="text-sm text-stone-400 font-medium">
              Total Points: <span className="text-eco-600 font-bold">{profile?.points ?? initialUser?.points ?? 0}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => { fetchProfile(); onRefresh?.(); }}
          className={cn("p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all text-stone-600", loadingProfile && "animate-spin")}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Eco Tip Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Star size={80} className="text-amber-400 fill-amber-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <Info size={20} />
            </div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Eco Tip of the Day</h4>
          </div>
          <p className="text-xl text-amber-900/80 font-medium leading-relaxed italic">
            "{currentTip}"
          </p>
        </div>
      </motion.div>

      {/* Recent Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-display font-black text-stone-900 uppercase tracking-tight">Recent Activity</h3>
          <div className="px-4 py-1.5 bg-stone-100 rounded-full text-[10px] font-black text-stone-500 uppercase tracking-widest">
            {history.length} Total Items
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {history.length > 0 ? history.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onItemClick?.(item.item_name)}
              className="flex items-center justify-between p-6 bg-white rounded-[28px] border border-stone-200 group hover:border-eco-300 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-eco-600 shadow-sm group-hover:scale-110 transition-transform relative">
                  {item.source === 'search' ? <Search size={24} /> : <Camera size={24} />}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-eco-100 rounded-full flex items-center justify-center border-2 border-white">
                    <Recycle size={12} className="text-eco-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-black text-stone-900">{item.item_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                      item.source === 'search' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {item.source === 'search' ? 'Searched' : 'Scanned'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-0.5">Eco Score</p>
                  <p className="text-lg font-black text-eco-600">{item.eco_score}</p>
                </div>
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 group-hover:text-eco-600 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-stone-50 border-2 border-dashed border-stone-200 rounded-[40px]">
              <Recycle size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-400 font-bold text-lg">No activity recorded yet.</p>
              <p className="text-stone-400 text-sm">Start by scanning or searching for an item!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Globe, Phone, Mail, ArrowRight, Loader2, Search, Heart, ShieldCheck } from 'lucide-react';
import { findNGOCenters } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const NGOCenters: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ngoData, setNgoData] = useState<{ text: string | undefined; sources: any[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNGOs = async (query?: string, lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const data = await findNGOCenters(query, lat, lng);
      setNgoData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchNGOs(searchQuery);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetchNGOs(undefined, pos.coords.latitude, pos.coords.longitude);
      });
    } else {
      fetchNGOs();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pb-32">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-black mb-6">
            <Heart size={18} />
            <span>SUPPORTING COMMUNITIES</span>
          </div>
          <h2 className="text-5xl font-display font-black mb-6 leading-none tracking-tighter">NGO & RECYCLING <br /><span className="text-eco-600">NETWORKS</span> IN INDIA</h2>
          <p className="text-lg text-stone-600 font-medium leading-relaxed">
            Connect with verified non-profit organizations and social enterprises across India dedicated to sustainable waste management and community empowerment.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-96 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-eco-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by city or state..." 
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-stone-200 rounded-2xl focus:outline-none focus:border-eco-500 transition-all shadow-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-eco-600 animate-spin mb-4" />
          <p className="font-bold text-stone-400 uppercase tracking-widest text-xs">Locating Verified Partners...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm">
              <h3 className="text-2xl font-display font-black text-stone-900 mb-8 flex items-center gap-3">
                <ShieldCheck className="text-eco-600" />
                Verified Organizations
              </h3>
              <div className="markdown-body prose prose-stone max-w-none">
                <ReactMarkdown>{ngoData?.text || ""}</ReactMarkdown>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {ngoData?.sources.map((source: any, i: number) => (
                source.maps && (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-eco-50 text-eco-600 rounded-2xl flex items-center justify-center">
                        <MapPin size={24} />
                      </div>
                      <a 
                        href={source.maps.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-stone-50 text-stone-400 hover:text-eco-600 rounded-full transition-colors"
                      >
                        <ArrowRight size={20} />
                      </a>
                    </div>
                    <h4 className="text-lg font-black text-stone-900 mb-2 group-hover:text-eco-600 transition-colors">{source.maps.title}</h4>
                    <p className="text-sm text-stone-500 font-medium mb-4">{source.maps.address || 'India'}</p>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-stone-400">
                      <div className="flex items-center gap-1">
                        <Globe size={12} />
                        <span>Website</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>Contact</span>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-stone-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-eco-600/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="text-xl font-display font-black mb-6 uppercase tracking-widest text-eco-500">Why NGOs?</h3>
              <p className="text-stone-400 font-medium leading-relaxed mb-8">
                NGOs in India play a critical role in the informal waste sector, helping waste pickers gain dignity and ensuring that "hard-to-recycle" items don't end up in our oceans or landfills.
              </p>
              <ul className="space-y-4">
                {[
                  "Social Inclusion for Waste Pickers",
                  "Specialized E-Waste Handling",
                  "Community Awareness Programs",
                  "Circular Economy Advocacy"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                    <div className="w-5 h-5 bg-eco-600 rounded-full flex items-center justify-center text-white">
                      <ArrowRight size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-eco-50 p-10 rounded-[40px] border border-eco-100">
              <h3 className="text-xl font-display font-black text-eco-900 mb-6 uppercase tracking-widest">Major Partners</h3>
              <div className="space-y-6">
                {[
                  { name: "Goonj", focus: "Clothing & Materials" },
                  { name: "Chintan", focus: "E-Waste & Advocacy" },
                  { name: "Saahas", focus: "Zero Waste Solutions" },
                  { name: "Hasiru Dala", focus: "Waste Picker Rights" }
                ].map((ngo, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-eco-600 shadow-sm font-black">
                      {ngo.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900">{ngo.name}</h4>
                      <p className="text-[10px] font-black text-eco-600 uppercase tracking-widest">{ngo.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

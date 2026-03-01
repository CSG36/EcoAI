import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Search, 
  Camera, 
  Upload, 
  Recycle, 
  Trash2, 
  Info, 
  MapPin, 
  ChevronRight, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Lightbulb,
  Award,
  BookOpen,
  ArrowRight,
  Globe,
  Zap,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { identifyItem, searchItem, findNearbyCenters, getMaterialInfo, getRecyclingQuiz } from './services/geminiService';
import { DisposalInfo, MaterialInfo } from './types';
import { cn } from './lib/utils';
import { RecyclingMap } from './components/RecyclingMap';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DisposalInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [nearbyResults, setNearbyResults] = useState<{ text: string | undefined; sources: any[] } | null>(null);
  const [mapCenters, setMapCenters] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'materials' | 'quiz'>('scan');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialInfo | null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setNearbyResults(null);
    
    try {
      const data = await searchItem(searchQuery);
      setResult(data);
      await fetchNearby(data.itemName);
    } catch (err) {
      setError('Failed to get recycling info. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearby = async (item: string) => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([latitude, longitude]);
      try {
        const centers = await findNearbyCenters(latitude, longitude, item);
        setNearbyResults(centers);
        
        // Extract coordinates from grounding chunks if available, or simulate for demo
        const parsedCenters = centers.sources.map((chunk: any, i: number) => ({
          id: `center-${i}`,
          name: chunk.maps?.title || 'Recycling Center',
          address: chunk.maps?.address || 'Nearby Location',
          lat: latitude + (Math.random() - 0.5) * 0.05, 
          lng: longitude + (Math.random() - 0.5) * 0.05,
          types: [item, 'General Recycling']
        }));
        setMapCenters(parsedCenters);
      } catch (err) {
        console.error('Failed to find nearby centers', err);
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setNearbyResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await identifyItem(base64, file.type);
        setResult(data);
        await fetchNearby(data.itemName);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      setLoading(false);
      console.error(err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
        
        processImage(base64);
      }
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setNearbyResults(null);
    try {
      const data = await identifyItem(base64, 'image/jpeg');
      setResult(data);
      await fetchNearby(data.itemName);
    } catch (err) {
      setError('Failed to analyze photo.');
    } finally {
      setLoading(false);
    }
  };

  const loadMaterialInfo = async (material: string) => {
    setMaterialLoading(true);
    setSelectedMaterial(null);
    try {
      const info = await getMaterialInfo(material);
      setSelectedMaterial(info);
    } catch (err) {
      console.error(err);
    } finally {
      setMaterialLoading(false);
    }
  };

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const data = await getRecyclingQuiz();
      setQuiz(data);
      setQuizIndex(0);
      setQuizScore(0);
      setShowQuizResult(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (answer === quiz[quizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setShowQuizResult(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-eco-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-eco-200">
              <Recycle size={24} />
            </div>
            <span className="text-xl font-display font-bold text-stone-900">EcoGuide AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-stone-500">
            <button 
              onClick={() => setActiveTab('scan')}
              className={cn("hover:text-eco-600 transition-colors", activeTab === 'scan' && "text-eco-600")}
            >
              Scan & Search
            </button>
            <button 
              onClick={() => setActiveTab('materials')}
              className={cn("hover:text-eco-600 transition-colors", activeTab === 'materials' && "text-eco-600")}
            >
              Materials
            </button>
            <button 
              onClick={() => { setActiveTab('quiz'); if (quiz.length === 0) loadQuiz(); }}
              className={cn("hover:text-eco-600 transition-colors", activeTab === 'quiz' && "text-eco-600")}
            >
              Eco Quiz
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-eco-100 text-eco-700 px-3 py-1 rounded-full text-xs font-bold">
              <Award size={14} />
              <span>{quizScore * 10} Points</span>
            </div>
            <button className="bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-eco-600 transition-all shadow-md active:scale-95">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'scan' && (
          <>
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://picsum.photos/seed/nature/1920/1080?blur=2" 
                  alt="Nature Background" 
                  className="w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-50/0 via-stone-50/80 to-stone-50" />
              </div>

              <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-eco-200 px-4 py-2 rounded-full text-eco-700 text-sm font-bold mb-8 shadow-sm"
                >
                  <Sparkles size={16} className="text-eco-500" />
                  <span>AI-Powered Recycling Intelligence</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-display font-black mb-8 text-stone-900 leading-[0.9] tracking-tighter"
                >
                  SAVE THE PLANET <br />
                  <span className="text-eco-600">ONE ITEM</span> AT A TIME.
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto font-medium"
                >
                  Join thousands of eco-warriors using AI to eliminate waste. Scan, search, and discover the best way to recycle anything.
                </motion.p>

                {/* Search & Upload Controls */}
                <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                  <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-eco-600 transition-colors" size={24} />
                    <input 
                      type="text" 
                      placeholder="What are you disposing of?" 
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-stone-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all shadow-xl text-lg font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  <div className="flex gap-3">
                    <button 
                      onClick={startCamera}
                      className="p-5 bg-eco-600 text-white rounded-3xl hover:bg-eco-700 transition-all shadow-lg hover:shadow-eco-200 active:scale-95 flex items-center gap-3"
                    >
                      <Camera size={28} />
                      <span className="md:hidden font-bold">Camera</span>
                    </button>
                    <div {...getRootProps()} className="cursor-pointer">
                      <input {...getInputProps()} />
                      <div className="p-5 bg-white text-stone-700 border-2 border-stone-200 rounded-3xl hover:bg-stone-100 transition-all shadow-lg active:scale-95 flex items-center gap-3">
                        <Upload size={28} />
                        <span className="md:hidden font-bold">Upload</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Results Section */}
            <div className="max-w-5xl mx-auto px-4 py-12">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-eco-600 animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={24} />
                  </div>
                  <p className="mt-6 text-stone-500 font-bold text-lg animate-pulse">Consulting Eco-Intelligence...</p>
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-700 mb-12 shadow-sm"
                >
                  <AlertCircle size={32} />
                  <div>
                    <p className="font-bold text-lg">Oops! Something went wrong.</p>
                    <p className="text-sm opacity-80">{error}</p>
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {result && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    className="space-y-12"
                  >
                    {/* Main Result Card */}
                    <div className="bg-white border-2 border-stone-100 rounded-[40px] overflow-hidden shadow-2xl shadow-stone-200/60">
                      <div className={cn(
                        "p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8",
                        result.isRecyclable ? "bg-eco-50" : "bg-orange-50"
                      )}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm">
                              {result.category}
                            </span>
                            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm">
                              <Zap size={14} className="text-amber-500" />
                              <span className="text-xs font-black text-stone-700">ECO SCORE: {result.ecoScore}/100</span>
                            </div>
                          </div>
                          <h2 className="text-4xl md:text-5xl font-display font-black text-stone-900 tracking-tight">{result.itemName}</h2>
                        </div>
                        <div className={cn(
                          "flex items-center gap-4 px-8 py-5 rounded-3xl font-black text-xl shadow-lg",
                          result.isRecyclable ? "bg-eco-600 text-white" : "bg-orange-600 text-white"
                        )}>
                          {result.isRecyclable ? <Recycle size={32} /> : <Trash2 size={32} />}
                          {result.isRecyclable ? "RECYCLABLE" : "NON-RECYCLABLE"}
                        </div>
                      </div>

                      <div className="p-10 grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                          <section>
                            <h3 className="flex items-center gap-3 text-stone-900 font-black text-xl mb-6 uppercase tracking-tight">
                              <div className="w-8 h-8 bg-eco-100 text-eco-600 rounded-lg flex items-center justify-center">
                                <Info size={20} />
                              </div>
                              Disposal Guide
                            </h3>
                            <div className="markdown-body text-lg bg-stone-50 p-8 rounded-3xl border border-stone-100">
                              <ReactMarkdown>{result.instructions}</ReactMarkdown>
                            </div>
                          </section>
                          
                          <section className="grid md:grid-cols-2 gap-8">
                            <div className="bg-eco-50/50 p-8 rounded-3xl border border-eco-100">
                              <h3 className="flex items-center gap-3 text-eco-900 font-black mb-4 uppercase text-sm tracking-widest">
                                <Leaf size={18} className="text-eco-600" />
                                Impact & Harmfulness
                              </h3>
                              <div className="space-y-4">
                                <p className="text-eco-800 font-medium leading-relaxed italic">
                                  "{result.environmentalImpact}"
                                </p>
                                <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-eco-100">
                                  <span className="text-xs font-black text-stone-500 uppercase">Harmfulness Score</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                      <div 
                                        className={cn(
                                          "h-full transition-all",
                                          result.harmfulnessScore > 7 ? "bg-red-500" : result.harmfulnessScore > 4 ? "bg-amber-500" : "bg-eco-500"
                                        )}
                                        style={{ width: `${result.harmfulnessScore * 10}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-black text-stone-900">{result.harmfulnessScore}/10</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-eco-100">
                                  <span className="text-xs font-black text-stone-500 uppercase">Recycling Duration</span>
                                  <span className="text-sm font-black text-stone-900">{result.recyclingDuration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100">
                              <h3 className="flex items-center gap-3 text-amber-900 font-black mb-4 uppercase text-sm tracking-widest">
                                <Lightbulb size={18} className="text-amber-600" />
                                Upcycling & Disposal
                              </h3>
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[10px] font-black text-amber-600 uppercase mb-2">Upcycling Ideas</h4>
                                  <ul className="space-y-2">
                                    {result.upcyclingIdeas.map((idea, idx) => (
                                      <li key={idx} className="flex items-start gap-3 text-amber-800 text-xs font-medium">
                                        <Sparkles size={12} className="text-amber-500 mt-1 shrink-0" />
                                        {idea}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="pt-4 border-t border-amber-100">
                                  <h4 className="text-[10px] font-black text-amber-600 uppercase mb-2">Disposal Recommendation</h4>
                                  <div className="bg-white/50 p-4 rounded-2xl space-y-2">
                                    <p className="text-xs font-bold text-stone-700"><span className="text-amber-600">Method:</span> {result.disposalRecommendations.method}</p>
                                    <p className="text-xs font-bold text-stone-700"><span className="text-amber-600">Where:</span> {result.disposalRecommendations.locationType}</p>
                                    <p className="text-xs font-bold text-stone-700"><span className="text-amber-600">Prep:</span> {result.disposalRecommendations.preparation}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="space-y-8">
                          <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl">
                            <h3 className="font-black mb-6 uppercase tracking-widest text-xs text-stone-400">Eco-Alternatives</h3>
                            <ul className="space-y-4">
                              {result.alternatives.map((alt, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-sm font-medium group cursor-default">
                                  <div className="w-6 h-6 bg-eco-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={14} />
                                  </div>
                                  <span className="group-hover:text-eco-400 transition-colors">{alt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {nearbyResults && (
                            <div className="bg-white border-2 border-eco-100 p-8 rounded-3xl shadow-lg">
                              <h3 className="flex items-center gap-3 text-stone-900 font-black mb-6 uppercase tracking-widest text-xs">
                                <MapPin size={18} className="text-eco-600" />
                                Interactive Map & Centers
                              </h3>
                              
                              <div className="mb-6">
                                <RecyclingMap centers={mapCenters} userLocation={userLocation} />
                              </div>

                              <div className="text-sm text-stone-600 space-y-6">
                                <div className="markdown-body text-xs">
                                  <ReactMarkdown>{nearbyResults.text || ""}</ReactMarkdown>
                                </div>
                                {nearbyResults.sources.length > 0 && (
                                  <div className="grid grid-cols-1 gap-3">
                                    {nearbyResults.sources.map((chunk: any, i: number) => (
                                      chunk.maps && (
                                        <a 
                                          key={i} 
                                          href={chunk.maps.uri} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-between p-4 bg-eco-50 rounded-2xl hover:bg-eco-100 transition-all border border-eco-100 group"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-bold text-eco-900 truncate pr-2">{chunk.maps.title}</span>
                                            <span className="text-[10px] text-stone-500">{chunk.maps.address || 'Click for details'}</span>
                                          </div>
                                          <ArrowRight size={18} className="text-eco-600 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                      )
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How it Works Section */}
            {!result && !loading && (
              <section className="py-24 bg-white border-y border-stone-200">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-black mb-4">HOW IT WORKS</h2>
                    <p className="text-stone-500 font-medium">Three simple steps to becoming a recycling pro.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-12">
                    {[
                      {
                        step: "01",
                        title: "Identify",
                        desc: "Take a photo or search for any item. Our AI analyzes the material instantly.",
                        img: "https://picsum.photos/seed/scan/600/400",
                        color: "bg-blue-600"
                      },
                      {
                        step: "02",
                        title: "Learn",
                        desc: "Get specific instructions on how to clean, sort, and dispose of the item correctly.",
                        img: "https://picsum.photos/seed/learn/600/400",
                        color: "bg-eco-600"
                      },
                      {
                        step: "03",
                        title: "Drop-off",
                        desc: "Find the nearest verified recycling centers for specialized waste like electronics.",
                        img: "https://picsum.photos/seed/map/600/400",
                        color: "bg-amber-600"
                      }
                    ].map((item, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="group"
                      >
                        <div className="relative h-64 rounded-[32px] overflow-hidden mb-8 shadow-xl">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <div className={cn("absolute top-6 left-6 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg", item.color)}>
                            {item.step}
                          </div>
                        </div>
                        <h3 className="text-2xl font-display font-black mb-3 uppercase tracking-tight">{item.title}</h3>
                        <p className="text-stone-600 font-medium leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === 'materials' && (
          <section className="max-w-6xl mx-auto px-4 py-20">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-display font-black mb-6 leading-none">MATERIAL <br /><span className="text-eco-600">ENCYCLOPEDIA</span></h2>
                <p className="text-lg text-stone-600 font-medium">Understand what things are made of and how they can be reborn. AI-powered composition analysis for every material.</p>
              </div>
              <div className="flex gap-2 bg-stone-100 p-2 rounded-2xl border border-stone-200">
                {['Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste'].map(m => (
                  <button 
                    key={m}
                    onClick={() => loadMaterialInfo(m)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      selectedMaterial?.name === m ? "bg-white text-eco-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {materialLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-eco-600 animate-spin mb-4" />
                <p className="font-bold text-stone-400 uppercase tracking-widest text-xs">Analyzing Molecular Structure...</p>
              </div>
            ) : selectedMaterial ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid lg:grid-cols-2 gap-12"
              >
                <div className="relative h-[500px] rounded-[40px] overflow-hidden shadow-2xl">
                  <img 
                    src={`https://picsum.photos/seed/${selectedMaterial.name}/800/1000`} 
                    alt={selectedMaterial.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <h3 className="text-4xl font-display font-black mb-2 uppercase tracking-tight">{selectedMaterial.name}</h3>
                    <div className="flex items-center gap-2 bg-eco-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      <Recycle size={14} />
                      <span>{selectedMaterial.recyclabilityRate} Recyclable</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-10 py-6">
                  <section>
                    <h4 className="text-xs font-black text-eco-600 uppercase tracking-[0.3em] mb-4">Composition</h4>
                    <p className="text-2xl font-medium text-stone-800 leading-tight">{selectedMaterial.composition}</p>
                  </section>

                  <section className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Common Uses</h4>
                      <ul className="space-y-2">
                        {selectedMaterial.commonUses.map((use, i) => (
                          <li key={i} className="flex items-center gap-2 text-stone-700 font-bold">
                            <div className="w-1.5 h-1.5 bg-eco-500 rounded-full" />
                            {use}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                      <h4 className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] mb-4">Fun Fact</h4>
                      <p className="text-sm text-amber-900 font-medium leading-relaxed italic">"{selectedMaterial.funFact}"</p>
                    </div>
                  </section>

                  <button 
                    onClick={() => { setActiveTab('scan'); setSearchQuery(selectedMaterial.name); }}
                    className="w-full py-5 bg-stone-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-eco-600 transition-all shadow-xl flex items-center justify-center gap-3 group"
                  >
                    Find Disposal Centers
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-[40px] py-32 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mb-6">
                  <BookOpen size={40} />
                </div>
                <h3 className="text-2xl font-display font-black mb-2">SELECT A MATERIAL</h3>
                <p className="text-stone-400 font-medium max-w-sm">Choose a material above to explore its molecular composition and recycling potential.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'quiz' && (
          <section className="max-w-3xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-black mb-6">
                <Award size={18} />
                <span>EARN ECO-POINTS</span>
              </div>
              <h2 className="text-5xl font-display font-black mb-4">RECYCLING <span className="text-eco-600">QUIZ</span></h2>
              <p className="text-stone-500 font-medium">Test your knowledge and become a certified Eco-Warrior.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-eco-600 animate-spin mb-4" />
                <p className="font-bold text-stone-400 uppercase tracking-widest text-xs">Generating AI Quiz...</p>
              </div>
            ) : showQuizResult ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-stone-100 rounded-[40px] p-12 text-center shadow-2xl"
              >
                <div className="w-24 h-24 bg-eco-100 text-eco-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Award size={48} />
                </div>
                <h3 className="text-4xl font-display font-black mb-4 uppercase">Quiz Complete!</h3>
                <p className="text-2xl font-bold text-stone-600 mb-8">You scored <span className="text-eco-600">{quizScore}/{quiz.length}</span></p>
                <div className="flex gap-4">
                  <button 
                    onClick={loadQuiz}
                    className="flex-1 py-5 bg-stone-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-eco-600 transition-all shadow-xl"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => setActiveTab('scan')}
                    className="flex-1 py-5 bg-white text-stone-900 border-2 border-stone-200 rounded-3xl font-black uppercase tracking-widest hover:bg-stone-50 transition-all"
                  >
                    Back to Scan
                  </button>
                </div>
              </motion.div>
            ) : quiz.length > 0 ? (
              <motion.div 
                key={quizIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border-2 border-stone-100 rounded-[40px] p-12 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-10">
                  <span className="text-xs font-black text-stone-400 uppercase tracking-[0.3em]">Question {quizIndex + 1} of {quiz.length}</span>
                  <div className="w-32 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-eco-600 transition-all duration-500" 
                      style={{ width: `${((quizIndex + 1) / quiz.length) * 100}%` }}
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-black mb-10 leading-tight">{quiz[quizIndex].question}</h3>
                <div className="grid gap-4">
                  {quiz[quizIndex].options.map((option: string, i: number) => (
                    <button 
                      key={i}
                      onClick={() => handleQuizAnswer(option)}
                      className="w-full p-6 text-left bg-stone-50 hover:bg-eco-50 border-2 border-stone-100 hover:border-eco-200 rounded-2xl font-bold transition-all flex items-center justify-between group"
                    >
                      {option}
                      <ChevronRight size={20} className="text-stone-300 group-hover:text-eco-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </section>
        )}
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => {
              const stream = videoRef.current?.srcObject as MediaStream;
              stream?.getTracks().forEach(track => track.stop());
              setShowCamera(false);
            }}
            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X size={28} />
          </button>
          <div className="relative w-full max-w-lg aspect-[3/4] rounded-[40px] overflow-hidden bg-stone-900 shadow-2xl border-4 border-white/10">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/40 rounded-3xl pointer-events-none" />
          </div>
          <button 
            onClick={capturePhoto}
            className="mt-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all p-2"
          >
            <div className="w-full h-full border-4 border-stone-900 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 bg-eco-600 rounded-full" />
            </div>
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6 text-white">
                <Recycle size={32} className="text-eco-500" />
                <span className="text-2xl font-display font-black uppercase tracking-tighter">EcoGuide AI</span>
              </div>
              <p className="text-lg text-stone-500 max-w-md font-medium">We're on a mission to use Artificial Intelligence to solve the world's waste crisis. Join us in building a circular economy.</p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="hover:text-eco-500 transition-colors">Materials</a></li>
                <li><a href="#" className="hover:text-eco-500 transition-colors">Centers</a></li>
                <li><a href="#" className="hover:text-eco-500 transition-colors">Quiz</a></li>
                <li><a href="#" className="hover:text-eco-500 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Community</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="hover:text-eco-500 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-eco-500 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-eco-500 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-eco-500 transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-black uppercase tracking-widest">© 2026 EcoGuide AI. All rights reserved.</p>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

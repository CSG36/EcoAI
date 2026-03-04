import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Recycle, Globe, Zap, ShieldCheck, Users, Sparkles, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1920&h=1080" 
            alt="Environment Forest" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-50/0 via-stone-50/80 to-stone-50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-eco-200 px-4 py-2 rounded-full text-eco-700 text-sm font-bold mb-8 shadow-sm"
          >
            <Sparkles size={16} className="text-eco-500" />
            <span>The Future of Waste Management</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-black mb-8 text-stone-900 leading-[0.85] tracking-tighter"
          >
            REVOLUTIONIZING <br />
            <span className="text-eco-600">RECYCLING</span> WITH AI.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto font-medium"
          >
            EcoGuide AI is your personal environmental assistant. We use advanced computer vision and real-time data to help you eliminate waste and build a cleaner planet.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/app"
              className="px-10 py-5 bg-eco-600 text-white rounded-3xl font-black text-xl hover:bg-eco-700 transition-all shadow-xl hover:shadow-eco-200 active:scale-95 flex items-center gap-3 group"
            >
              Get Started Now
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              to="/register"
              className="px-10 py-5 bg-white text-stone-900 border-2 border-stone-200 rounded-3xl font-black text-xl hover:bg-stone-100 transition-all shadow-xl active:scale-95"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 text-eco-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 bg-eco-50 px-3 py-1 rounded-full">
                <Leaf size={12} />
                <span>Our Purpose</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-display font-black mb-8 leading-[0.9] tracking-tighter">
                OUR MISSION: <br />
                <span className="text-eco-600">ZERO WASTE</span> REALITY.
              </h2>
              <p className="text-xl text-stone-600 font-medium mb-10 leading-relaxed max-w-xl">
                Every year, billions of tons of waste end up in landfills because of improper sorting. We believe technology is the key to solving this. By empowering individuals with AI, we can ensure every item finds its proper second life.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4 p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <div className="w-12 h-12 bg-eco-100 text-eco-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Globe size={24} />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-stone-900">Global Impact</h4>
                  <p className="text-stone-500 text-xs font-medium leading-relaxed">Connecting users to verified recycling centers worldwide for a cleaner planet.</p>
                </div>
                <div className="space-y-4 p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Zap size={24} />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-stone-900">Real-time AI</h4>
                  <p className="text-stone-500 text-xs font-medium leading-relaxed">Instant material identification and disposal guidance at your fingertips.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[48px] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square order-1 lg:order-2"
            >
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000&h=1000" 
                alt="Eco Mission" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-display font-black mb-6">INNOVATIVE FEATURES</h2>
            <p className="text-xl text-stone-500 font-medium max-w-2xl mx-auto">Built with the latest AI technology to make sustainability effortless and rewarding.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Recycle size={32} />,
                title: "AI Scan & Identify",
                desc: "Point your camera at any object and our AI will tell you exactly how to recycle it.",
                img: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800&h=600",
                color: "bg-blue-600"
              },
              {
                icon: <Leaf size={32} />,
                title: "Eco-Score Tracking",
                desc: "Track your environmental impact and earn points for every item you recycle correctly.",
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600",
                color: "bg-eco-600"
              },
              {
                icon: <ShieldCheck size={32} />,
                title: "Verified Centers",
                desc: "Access a global database of verified recycling facilities with real-time directions.",
                img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800&h=600",
                color: "bg-amber-600"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-stone-200 group"
              >
                <div className="h-56 overflow-hidden">
                  <img src={feature.img} alt={feature.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-10">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", feature.color)}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-display font-black mb-4 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-stone-600 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#059669_0%,transparent_50%)]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-display font-black mb-10 leading-none tracking-tighter">READY TO MAKE AN <br /><span className="text-eco-500">IMPACT?</span></h2>
          <p className="text-xl text-stone-400 mb-12 max-w-2xl mx-auto font-medium">Join our community of eco-warriors and start tracking your journey towards a zero-waste lifestyle today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/register"
              className="px-12 py-6 bg-eco-600 text-white rounded-full font-black text-xl hover:bg-eco-700 transition-all shadow-2xl shadow-eco-600/20 active:scale-95"
            >
              Join the Movement
            </Link>
            <Link 
              to="/app"
              className="px-12 py-6 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-black text-xl hover:bg-white/20 transition-all"
            >
              Try the App
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

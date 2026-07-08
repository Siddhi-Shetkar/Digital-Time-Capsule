import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed, HiShare, HiCamera, HiClock } from 'react-icons/hi';

const Landing = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Preserve Today, <br/>
                <span className="text-gradient">Discover Tomorrow.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Securely store your digital memories—messages, photos, and videos—and lock them until a future date. Experience the joy of rediscovery.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                  Start Your Capsule
                </Link>
                <Link to="/gallery" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors">
                  Explore Public Gallery
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Premium Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to capture and preserve your most important moments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <HiClock size={32}/>, title: 'Time-Locked', desc: 'Set a future date. Your memories remain completely inaccessible until then.' },
              { icon: <HiLockClosed size={32}/>, title: 'Bank-Grade Security', desc: 'End-to-end encryption ensures only you and intended recipients can access.' },
              { icon: <HiCamera size={32}/>, title: 'Rich Media', desc: 'Upload photos, videos, audio, and documents all in one beautiful capsule.' },
              { icon: <HiShare size={32}/>, title: 'Share & Discover', desc: 'Keep it private, share with friends, or publish to our global public gallery.' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

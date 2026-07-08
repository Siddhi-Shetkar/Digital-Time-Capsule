import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUpload, HiOutlineLockClosed, HiOutlineGlobeAlt, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    message: '',
    category: 'Personal',
    unlockDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message || !formData.unlockDate) {
      return toast.error('Please fill in all required fields');
    }
    setShowModal(true);
  };

  const createCapsule = async (status) => {
    setLoading(true);
    
    try {
      await axios.post('/api/capsules', {
        ...formData,
        status
      });
      toast.success(`Capsule ${status === 'public' ? 'made public' : 'locked'} successfully!`);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create capsule');
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Capsule</h1>
          <p className="text-gray-400">Store your memories and set a date for them to be revealed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Capsule Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g., Message to my future self"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Brief description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">The Message</label>
              <textarea
                name="message"
                required
                rows="6"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="Write your memories, thoughts, or feelings..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  {['Personal', 'Birthday', 'Graduation', 'Family', 'Love', 'Future Goals'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Unlock Date</label>
                <input
                  type="date"
                  name="unlockDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.unlockDate}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Media Upload</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-background/50 hover:bg-white/5 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <HiOutlineUpload size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-300 font-medium mb-1">Click or drag files to upload</p>
                <p className="text-gray-500 text-sm">Supports Images, Videos, Audio, PDFs</p>
                {files.length > 0 && (
                  <p className="mt-4 text-primary text-sm font-medium">{files.length} file(s) selected</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-white text-background font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Save Capsule
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => !loading && setShowModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card relative z-10 w-full max-w-lg p-8 border border-white/20"
            >
              <button 
                onClick={() => !loading && setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <HiX size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-2 text-center">What would you like to do with this capsule?</h2>
              <p className="text-gray-400 text-center mb-8">Choose how you want to save this memory.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => createCapsule('locked')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 hover:border-accent hover:from-accent/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                    <HiOutlineLockClosed size={32} />
                  </div>
                  <span className="text-white font-bold text-lg">Lock Capsule</span>
                  <span className="text-gray-400 text-sm text-center mt-2">Keep it private until the unlock date.</span>
                </button>
                
                <button
                  onClick={() => createCapsule('public')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 hover:border-primary hover:from-primary/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <HiOutlineGlobeAlt size={32} />
                  </div>
                  <span className="text-white font-bold text-lg">Make Public</span>
                  <span className="text-gray-400 text-sm text-center mt-2">Share immediately in the Public Gallery.</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCapsule;

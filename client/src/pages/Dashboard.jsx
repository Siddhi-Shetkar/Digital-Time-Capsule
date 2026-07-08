import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineGlobeAlt, 
  HiOutlineArchive, HiOutlineEyeOff, HiOutlineDocumentText,
  HiOutlineTrash, HiOutlinePencil, HiOutlineEye
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card flex items-center space-x-4"
  >
    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <motion.h4 
        key={value}
        initial={{ scale: 1.2, color: '#38bdf8' }}
        animate={{ scale: 1, color: '#ffffff' }}
        className="text-2xl font-bold"
      >
        {value}
      </motion.h4>
    </div>
  </motion.div>
);

const CountdownTimer = ({ unlockDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const unlock = new Date(unlockDate);
      const diff = unlock - now;
      if (diff <= 0) return 'Ready to unlock!';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      return `${days}d ${hours}h remaining`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 60000);
    return () => clearInterval(interval);
  }, [unlockDate]);

  return <span className="text-accent font-mono text-xs font-bold">{timeLeft}</span>;
};

const LockModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) return toast.error('Please select both date and time');
    const unlockDate = new Date(`${date}T${time}`);
    if (unlockDate <= new Date()) {
      return toast.error('Unlock date must be in the future');
    }
    onConfirm(unlockDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 md:p-8 w-full max-w-md relative border border-white/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h3 className="text-xl font-bold text-white mb-2">Lock Capsule</h3>
        <p className="text-sm text-gray-400 mb-6">Choose when this capsule can be unlocked.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Unlock Date</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Unlock Time</label>
            <input 
              type="time" 
              required 
              value={time} 
              onChange={e => setTime(e.target.value)} 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-6 py-3 rounded-xl bg-accent text-background font-bold text-base hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            {loading ? 'Locking...' : 'Confirm Lock'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CapsuleCard = ({ capsule, onAction, onDelete, idx }) => {
  const { status, title, category, unlockDate, createdAt, media } = capsule;
  const isLocked = new Date(unlockDate) > new Date();

  const getStatusConfig = () => {
    switch (status) {
      case 'locked': return { icon: <HiOutlineLockClosed />, color: 'text-accent', bg: 'bg-accent/10', label: 'Locked' };
      case 'unlocked': return { icon: <HiOutlineLockOpen />, color: 'text-secondary', bg: 'bg-secondary/10', label: 'Unlocked' };
      case 'public': return { icon: <HiOutlineGlobeAlt />, color: 'text-primary', bg: 'bg-primary/10', label: 'Public' };
      case 'private': return { icon: <HiOutlineEyeOff />, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Private' };
      case 'draft': return { icon: <HiOutlineDocumentText />, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Draft' };
      default: return { icon: <HiOutlineArchive />, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Unknown' };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ delay: idx * 0.05 }}
      className="glass-card flex flex-col relative overflow-hidden group"
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${config.bg.replace('/10', '')}`} />
      
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-300">
          {category}
        </span>
        <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
          <span className="mr-1">{config.icon}</span> {config.label}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{title}</h3>
      
      <div className="text-gray-400 text-xs mb-4 space-y-1">
        <p>Created: {new Date(createdAt).toLocaleDateString()}</p>
        {(status === 'locked' || status === 'unlocked') && (
          <p>Unlocks: {new Date(unlockDate).toLocaleDateString()}</p>
        )}
        <p>Media: {media?.length || 0} items attached</p>
      </div>

      {status === 'locked' && isLocked && (
        <div className="mb-4 bg-background/50 p-2 rounded-lg text-center">
          <CountdownTimer unlockDate={unlockDate} />
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-white/10 flex justify-end gap-2">
        {status === 'locked' && (
          <>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="View Details"><HiOutlineEye size={18} /></button>
            <button onClick={() => onAction(capsule._id, 'public')} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">Make Public</button>
            <button onClick={() => onAction(capsule._id, 'private')} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30">Make Private</button>
            <button onClick={() => onDelete(capsule._id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash size={18} /></button>
            <button 
              onClick={() => onAction(capsule._id, 'unlock')}
              disabled={isLocked}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${isLocked ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-secondary text-background hover:bg-secondary/90'}`}
            >
              Unlock
            </button>
          </>
        )}
        
        {status === 'unlocked' && (
          <>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit"><HiOutlinePencil size={18} /></button>
            <button onClick={() => onAction(capsule._id, 'public')} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">Make Public</button>
            <button onClick={() => onAction(capsule._id, 'private')} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30">Make Private</button>
            <button onClick={() => onDelete(capsule._id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash size={18} /></button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">Open Capsule</button>
          </>
        )}

        {status === 'public' && (
          <>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="View"><HiOutlineEye size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit"><HiOutlinePencil size={18} /></button>
            <button onClick={() => onAction(capsule._id, 'lockRequest')} className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30">Lock Capsule</button>
            <button onClick={() => onAction(capsule._id, 'private')} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30">Make Private</button>
            <button onClick={() => onDelete(capsule._id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash size={18} /></button>
          </>
        )}

        {status === 'private' && (
          <>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="View"><HiOutlineEye size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit"><HiOutlinePencil size={18} /></button>
            <button onClick={() => onAction(capsule._id, 'public')} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">Make Public</button>
            <button onClick={() => onAction(capsule._id, 'lockRequest')} className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30">Lock Capsule</button>
            <button onClick={() => onDelete(capsule._id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash size={18} /></button>
          </>
        )}
        
        {status === 'draft' && (
          <>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit"><HiOutlinePencil size={18} /></button>
            <button onClick={() => onAction(capsule._id, 'public')} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">Make Public</button>
            <button onClick={() => onAction(capsule._id, 'private')} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30">Make Private</button>
            <button onClick={() => onAction(capsule._id, 'lockRequest')} className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30">Lock Capsule</button>
            <button onClick={() => onDelete(capsule._id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash size={18} /></button>
          </>
        )}
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockingCapsuleId, setLockingCapsuleId] = useState(null);
  const [isLocking, setIsLocking] = useState(false);

  const fetchCapsules = useCallback(async () => {
    try {
      const res = await axios.get('/api/capsules/my-capsules');
      setCapsules(res.data);
    } catch (error) {
      console.error('Failed to fetch capsules', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  const handleAction = async (id, actionType, payload = null) => {
    try {
      if (actionType === 'lockRequest') {
        setLockingCapsuleId(id);
        return;
      }
      
      let url = `/api/capsules/${id}/${actionType}`;
      let data = {};
      
      if (actionType === 'lock') {
        data = { unlockDate: payload };
        setIsLocking(true);
      }
      
      await axios.patch(url, data);
      toast.success(`Capsule updated successfully`);
      fetchCapsules(); // Auto-refresh immediately
      if (actionType === 'lock') {
        setLockingCapsuleId(null);
        setIsLocking(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update capsule');
      if (actionType === 'lock') setIsLocking(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this capsule?')) return;
    try {
      await axios.delete(`/api/capsules/${id}`);
      toast.success('Capsule deleted successfully');
      fetchCapsules();
    } catch (error) {
      toast.error('Failed to delete capsule');
    }
  };

  const stats = {
    total: capsules.length,
    locked: capsules.filter(c => c.status === 'locked').length,
    unlocked: capsules.filter(c => c.status === 'unlocked').length,
    public: capsules.filter(c => c.status === 'public').length,
    private: capsules.filter(c => c.status === 'private').length,
    draft: capsules.filter(c => c.status === 'draft').length,
    upcoming: capsules.filter(c => c.status === 'locked' && new Date(c.unlockDate) > new Date()).length
  };

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-gray-400">Here's an overview of your digital memories.</p>
        </div>
        <Link 
          to="/create" 
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          Create Capsule
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-12">
        <StatCard title="Total" value={stats.total} icon={<HiOutlineArchive size={20} />} delay={0.1} />
        <StatCard title="Locked" value={stats.locked} icon={<HiOutlineLockClosed size={20} />} delay={0.2} />
        <StatCard title="Unlocked" value={stats.unlocked} icon={<HiOutlineLockOpen size={20} />} delay={0.3} />
        <StatCard title="Public" value={stats.public} icon={<HiOutlineGlobeAlt size={20} />} delay={0.4} />
        <StatCard title="Private" value={stats.private} icon={<HiOutlineEyeOff size={20} />} delay={0.5} />
        <StatCard title="Drafts" value={stats.draft} icon={<HiOutlineDocumentText size={20} />} delay={0.6} />
        <StatCard title="Upcoming" value={stats.upcoming} icon={<HiOutlineLockClosed size={20} />} delay={0.7} />
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Your Capsules</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : capsules.length === 0 ? (
        <div className="glass-card text-center py-16 border-dashed border-white/20">
          <HiOutlineArchive className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No capsules yet</h3>
          <p className="text-gray-400 mb-6">Create your first digital time capsule to preserve your memories.</p>
          <Link 
            to="/create" 
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors inline-block"
          >
            Create Capsule
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {capsules.map((capsule, idx) => (
              <CapsuleCard 
                key={capsule._id} 
                capsule={capsule} 
                idx={idx}
                onAction={handleAction}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {lockingCapsuleId && (
          <LockModal 
            isOpen={!!lockingCapsuleId} 
            loading={isLocking}
            onClose={() => setLockingCapsuleId(null)} 
            onConfirm={(unlockDate) => handleAction(lockingCapsuleId, 'lock', unlockDate)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

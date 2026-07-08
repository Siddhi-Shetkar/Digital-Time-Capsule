import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSearch, HiOutlineHeart, HiHeart, HiOutlineChat, HiOutlineShare, 
  HiOutlineArchive, HiOutlineEye, HiOutlineEyeOff, HiOutlineLockClosed, 
  HiOutlineTrash, HiOutlinePencil, HiOutlineGlobeAlt
} from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Unlock Time</label>
            <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <button type="submit" disabled={loading} className="w-full mt-6 py-3 rounded-xl bg-accent text-background font-bold text-base hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50">
            {loading ? 'Locking...' : 'Confirm Lock'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="glass-card p-0 flex flex-col overflow-hidden animate-pulse">
    <div className="h-48 bg-white/5 w-full"></div>
    <div className="p-6">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-white/5 rounded w-1/2 mb-6"></div>
      <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
      <div className="h-4 bg-white/5 rounded w-2/3 mb-6"></div>
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="h-8 bg-white/10 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

const IMAGE_MAP = {
  birthday: ['1530103862676-de3c9de59f9e', '1558636508-e0db3814bd1d'],
  graduation: ['1523050854058-8df90110c9f1', '1541339907198-e08756dedf3f'],
  family: ['1511895426328-dc8714191300', '1511895426328-dc8714191300'],
  travel: ['1493976040374-85c8e12f0c0e', '1476514525535-07fb3b4ae5f1'],
  japan: ['1493976040374-85c8e12f0c0e', '1503899036067-e5917f683f0f'],
  beach: ['1507525428034-b723cf961d3e', '1519046904884-53103b1843d1'],
  career: ['1522071820081-009f0129c71c', '1497215728101-856f4ea42174'],
  startup: ['1522071820081-009f0129c71c', '1497215728101-856f4ea42174'],
  wedding: ['1511285560929-80a456fea0bc', '1519741497674-611481863552'],
  love: ['1518199266791-5375a507f3ed', '1511285560929-80a456fea0bc'],
  friends: ['1529156069898-49953e39b3ac', '1523301343968-6a6ebf63c673'],
  nature: ['1441974231531-c6227dbb6b4e', '1472214103451-9374bd1c798e'],
  fitness: ['1517836357463-d25dfeac3438', '1534438327276-14e5300c3a48'],
  reading: ['1512820790803-83c7326a38b5', '1495446815901-a7297e633e8d'],
  study: ['1434030216411-0b793f4b4173', '1513258496099-481a80418463'],
  coding: ['1498050108023-c5249f4df085', '1555066931-4365d14bab8c'],
  food: ['1414235077428-9711555e7dc5', '1495474472201-995a56d95328'],
  fallback: [
    '1516542076529-1ea3854896f2', 
    '1516542076529-1ea3854896f2', 
    '1516542076529-1ea3854896f2',
    '1516542076529-1ea3854896f2',
    '1516542076529-1ea3854896f2'
  ]
};

const getDeterministicImage = (title, category) => {
  const text = `${title} ${category}`.toLowerCase();
  let selectedKeyword = 'fallback';
  
  for (const keyword of Object.keys(IMAGE_MAP)) {
    if (keyword !== 'fallback' && text.includes(keyword)) {
      selectedKeyword = keyword;
      break;
    }
  }

  const ids = IMAGE_MAP[selectedKeyword];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const photoId = ids[hash % ids.length];
  
  return `https://images.unsplash.com/photo-${photoId}?q=80&w=800&auto=format&fit=crop`;
};

const IntelligentImage = ({ title, category, externalUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const intelligentUrl = getDeterministicImage(title, category);
  const imageUrl = externalUrl && !error ? externalUrl : intelligentUrl;
  const fallbackUrl = 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="w-full h-full relative bg-surface">
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
      <img 
        loading="lazy" 
        src={error ? fallbackUrl : imageUrl} 
        alt={title}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

const GalleryCard = ({ capsule, currentUser, onLike, onOwnerAction }) => {
  const isOwner = currentUser && capsule.author?._id === currentUser.id;
  const isLiked = currentUser && capsule.likes?.includes(currentUser.id);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="glass-card flex flex-col overflow-hidden group p-0 relative"
    >
      {/* Intelligent Cover Image */}
      <div className="h-48 w-full relative bg-background overflow-hidden">
        <IntelligentImage 
          title={capsule.title} 
          category={capsule.category} 
          externalUrl={capsule.media && capsule.media.length > 0 && capsule.media[0].resource_type === 'image' ? capsule.media[0].url : null}
        />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md text-primary text-xs font-medium border border-primary/20">
            {capsule.category}
          </span>
          {capsule.mood && capsule.mood !== 'Neutral' && (
            <span className="px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md text-secondary text-xs font-medium border border-secondary/20">
              {capsule.mood}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
            {capsule.title}
          </h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
          {capsule.description || 'No description provided.'}
        </p>

        {/* Tags */}
        {capsule.tags && capsule.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {capsule.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">#{tag}</span>
            ))}
          </div>
        )}
        
        <div className="mt-auto flex flex-col space-y-4 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>By {capsule.author?.name || 'Anonymous'}</span>
            <span>{new Date(capsule.createdAt).toLocaleDateString()}</span>
          </div>

          {/* User Interactions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onLike(capsule._id)} 
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-pink-500 transition-colors"
              >
                {isLiked ? <HiHeart className="text-pink-500" size={18} /> : <HiOutlineHeart size={18} />}
                <span>{capsule.likes?.length || 0}</span>
              </button>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <HiOutlineChat size={18} />
                <span>{capsule.comments?.length || 0}</span>
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/gallery?id=' + capsule._id);
                toast.success('Link copied to clipboard');
              }} className="text-gray-400 hover:text-white transition-colors">
                <HiOutlineShare size={18} />
              </button>
            </div>
            
            <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center">
              <HiOutlineEye className="mr-1" /> View
            </button>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
              <button onClick={() => onOwnerAction(capsule._id, 'edit')} className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit"><HiOutlinePencil size={16}/></button>
              <button onClick={() => onOwnerAction(capsule._id, 'private')} className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="Make Private"><HiOutlineEyeOff size={16}/></button>
              <button onClick={() => onOwnerAction(capsule._id, 'lock')} className="p-2 text-gray-400 hover:text-accent transition-colors" title="Lock"><HiOutlineLockClosed size={16}/></button>
              <button onClick={() => onOwnerAction(capsule._id, 'delete')} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash size={16}/></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PublicGallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mood, setMood] = useState('All');
  const [sort, setSort] = useState('Newest');

  // Modals
  const [lockingId, setLockingId] = useState(null);
  const [isLocking, setIsLocking] = useState(false);

  const observer = useRef();
  
  const categories = ['All', 'Personal', 'Birthday', 'Graduation', 'Family', 'Friends', 'Career', 'Future Goals', 'Love', 'Travel', 'Memories', 'Custom'];
  const moods = ['All', 'Neutral', 'Happy', 'Nostalgic', 'Hopeful', 'Excited', 'Reflective'];
  const sorts = ['Newest', 'Oldest', 'Most Liked'];

  const fetchCapsules = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const currentPage = isLoadMore ? page + 1 : 1;
      const res = await axios.get('/api/capsules/public', {
        params: { page: currentPage, limit: 8, search, category, mood, sort }
      });

      if (isLoadMore) {
        setCapsules(prev => [...prev, ...res.data.data]);
        setPage(currentPage);
      } else {
        setCapsules(res.data.data);
        setPage(1);
      }

      setHasMore(res.data.page < res.data.pages);
    } catch (error) {
      console.error('Failed to fetch public gallery', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category, mood, sort, page]);

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchCapsules(false);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, mood, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchCapsules(true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, fetchCapsules]);

  const handleLike = async (id) => {
    if (!user) return toast.error('Please login to like capsules');
    
    // Optimistic UI
    setCapsules(prev => prev.map(c => {
      if (c._id === id) {
        const isLiked = c.likes.includes(user.id);
        const newLikes = isLiked ? c.likes.filter(l => l !== user.id) : [...c.likes, user.id];
        return { ...c, likes: newLikes };
      }
      return c;
    }));

    try {
      await axios.post(`/api/capsules/${id}/like`);
    } catch (error) {
      toast.error('Failed to update like');
      fetchCapsules(false); // Revert on failure
    }
  };

  const handleOwnerAction = async (id, action) => {
    if (action === 'edit') {
      // Typically navigate to an edit page, or open a modal. 
      // For now, redirect to dashboard or show info
      toast.info('Edit mode not fully implemented here yet.');
      return;
    }
    
    if (action === 'lock') {
      setLockingId(id);
      return;
    }

    if (action === 'delete') {
      if (!window.confirm('Are you sure you want to delete this capsule permanently?')) return;
      try {
        await axios.delete(`/api/capsules/${id}`);
        setCapsules(prev => prev.filter(c => c._id !== id));
        toast.success('Capsule deleted');
      } catch (err) {
        toast.error('Failed to delete capsule');
      }
      return;
    }

    if (action === 'private') {
      try {
        await axios.patch(`/api/capsules/${id}/private`);
        setCapsules(prev => prev.filter(c => c._id !== id));
        toast.success('Capsule is now private');
      } catch (err) {
        toast.error('Failed to update capsule');
      }
    }
  };

  const confirmLock = async (unlockDate) => {
    setIsLocking(true);
    try {
      await axios.patch(`/api/capsules/${lockingId}/lock`, { unlockDate });
      setCapsules(prev => prev.filter(c => c._id !== lockingId));
      toast.success('Capsule locked and removed from public gallery');
      setLockingId(null);
    } catch (error) {
      toast.error('Failed to lock capsule');
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">Public Gallery</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Explore shared memories, stories, and predictions from our global community.</p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center z-10 relative">
        <div className="w-full md:w-1/3 relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles..."
            className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <div className="w-full md:w-2/3 flex flex-wrap md:flex-nowrap gap-4">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 min-w-[120px] bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          
          <select 
            value={mood} 
            onChange={(e) => setMood(e.target.value)}
            className="flex-1 min-w-[120px] bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            {moods.map(m => <option key={m} value={m}>{m === 'All' ? 'All Moods' : m}</option>)}
          </select>
          
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="flex-1 min-w-[120px] bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            {sorts.map(s => <option key={s} value={s}>Sort: {s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-grow">
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : capsules.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-48 h-48 mb-8 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(56,189,248,0.1)]">
              <HiOutlineGlobeAlt className="text-primary/50 absolute w-24 h-24 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No public capsules found</h3>
            <p className="text-gray-400 max-w-md mb-8">Be the first to share a memory with the world, or try adjusting your search filters.</p>
            <Link 
              to={user ? "/create" : "/register"} 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              {user ? "Create Your First Public Capsule" : "Join to Create a Capsule"}
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {capsules.map((capsule, index) => {
                  const isLast = index === capsules.length - 1;
                  return (
                    <div ref={isLast ? lastElementRef : null} key={capsule._id}>
                      <GalleryCard 
                        capsule={capsule} 
                        currentUser={user} 
                        onLike={handleLike}
                        onOwnerAction={handleOwnerAction}
                      />
                    </div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
            
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {lockingId && (
          <LockModal 
            isOpen={!!lockingId} 
            loading={isLocking} 
            onClose={() => setLockingId(null)} 
            onConfirm={confirmLock} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicGallery;

import { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, Search, Filter, Key, Loader2, Star, EyeOff, Eye, 
  BookOpen, Tag, Info, ExternalLink, MessageSquare, Settings, 
  User, Download, Upload, Play, Pause, RotateCcw, Copy, Trash2, Plus, Clock, RefreshCw, Grid
} from 'lucide-react';
import { mockPosts, mockUsers } from './mockData';
import preScrapedUsers from './scrapedUsers.json';
import preScrapedComments from './scrapedComments.json';
import preScrapedLocationPosts from './scrapedLocationPosts.json';
import './App.css';

const SPANISH_FEMALE_NAMES = new Set([
  'laura', 'sofia', 'sofía', 'clara', 'maria', 'maría', 'ana', 'cristina', 'marta', 'paula', 'andrea', 'sandra',
  'patricia', 'beatriz', 'silvia', 'irene', 'natalia', 'alba', 'julia', 'julieta', 'lucia', 'lucía', 'carmen', 'isabel',
  'teresa', 'pilar', 'dolores', 'rosa', 'manuela', 'raquel', 'monica', 'mónica', 'veronica', 'verónica', 'lorena',
  'miriam', 'eva', 'marina', 'claudia', 'sara', 'nuria', 'núria', 'ainhoa', 'vanessa', 'noelia', 'judith', 'ruth',
  'esther', 'lidia', 'salma', 'yasmin', 'begoña', 'reyes', 'lourdes', 'macarena', 'virginia', 'tamara', 'loreto',
  'nora', 'mercedes', 'nieves', 'gema', 'roser', 'montserrat', 'carme', 'carlota', 'valeria', 'jimena', 'inés', 'ines',
  'adriana', 'ariadna', 'aurora', 'blanca', 'candela', 'carla', 'celia', 'daniela', 'elsa', 'estela', 'gabriela',
  'gloria', 'lola', 'nerea', 'olga', 'olivia', 'rocío', 'rocio', 'triana', 'valentina', 'victoria', 'alejandra', 'rebeca',
  'leticia', 'karla', 'diana', 'sheila', 'ainhoa', 'judith', 'ruth', 'esther', 'lidia', 'angels', 'montse', 'belen', 'belén',
  'luz', 'nieve', 'nieves', 'esperanza', 'concepcion', 'concha', 'soledad', 'sol', 'mar',
  'araceli', 'milagros', 'gema', 'amparo', 'remedios', 'cruz', 'carmina', 'carmela',
  'itziar', 'naroa', 'amaia', 'leire', 'leyre', 'edurne', 'maite', 'nekane', 'estibaliz', 'idoia', 'arantxa', 'aranzazu',
  'ainara', 'uxue', 'oihane', 'irati', 'garazi', 'ane', 'miren', 'begoña', 'nekane', 'itxaso', 'alazne', 'agurtzane',
  'gemma', 'estela', 'carme', ' Angels', 'àngels', 'meritxell', 'laia', 'neila', 'nuria', 'eulalia', 'eulàlia',
  'alba', 'berta', 'emma', 'joana', 'julia', 'júlia', 'ona', 'bruna', 'mariona', 'queralt', 'vinyet', 'ares', 'urgell'
]);

const getProxiedImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://localhost') || url.includes('/api/image-proxy')) {
    return url;
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
};

// Heuristics lists for gender detection
const FEMALE_NAMES = new Set([
  "laura", "chloe", "martina", "sofia", "clara", "emma", "lucie", "laia", "anna", "zoe", "alicia", "elena", 
  "jessica", "sara", "nuria", "maria", "ana", "cristina", "marta", "paula", "andrea", "sandra", "patricia", 
  "beatriz", "silvia", "irene", "natalia", "alba", "julia", "lucia", "carmen", "isabel", "teresa", "pilar", 
  "dolores", "rosa", "manuela", "raquel", "monica", "veronica", "lorena", "miriam", "eva", "marina", "claudia", 
  "carla", "daniela", "berta", "mireia", "gemma", "meritxell", "neus", "nerea", "amaia", "ainara", "itziar", 
  "leyre", "nathalie", "isabelle", "sylvie", "catherine", "francoise", "martine", "christine", "monique", 
  "jacqueline", "valerie", "sandrine", "stephanie", "veronique", "sophie", "celine", "chantal", "brigitte", 
  "julie", "sarah", "elodie", "emilie", "aurelie", "lea", "manon", "camille", "ines", "jade", "alice", 
  "louise", "lola", "jeanne", "juliette", "charlotte", "margot", "mathilde", "clementine", "pauline", 
  "marion", "caroline", "ashley", "taylor", "megan", "amanda", "nicole", "hannah", "katherine", "elizabeth", 
  "victoria", "rebecca", "lauren", "samantha", "kayla", "brittany", "alyssa", "rachel", "jasmine", "morgan", 
  "destiny", "amber", "madison", "abigail", "olivia", "sophia", "isabella", "ava", "mia", "gabriela", 
  "valeria", "camila", "mariana", "alejandra", "fernanda", "adriana", "estefania", "liliana", "melissa", 
  "alexandra", "mariela", "paola", "regina", "renata", "rebeca", "leticia", "karla", "diana", "sheila", 
  "ainhoa", "vanessa", "noelia", "judith", "ruth", "esther", "lidia", "salma", "yasmin", "amal", "leila", 
  "fatima", "nour", "luna", "iris", "flora", "aurora", "selena", "linda", "lisa", "nina", "vera", "olga", 
  "tatiana", "irina", "elisa", "sonia", "gisela", "carol", "vanesa", "estel", "mar", "sol", "estela", 
  "begoña", "reyes", "lourdes", "macarena", "virginia", "tamara", "loreto", "nora", "mercedes", "concepcion", 
  "nieves", "milagros", "amparo", "gema", "roser", "angels", "montserrat", "dolors", "carme", "eulalia", 
  "conxita", "assumpcio", "remey", "khadija", "amina"
]);

const MALE_NAMES = new Set([
  "david", "carlos", "juan", "jose", "miguel", "pedro", "manuel", "francisco", "antonio", "javier", 
  "alejandro", "daniel", "jorge", "alberto", "marc", "jordi", "joan", "pierre", "jean", "michel", 
  "philippe", "thomas", "nicolas", "julien", "guillaume", "sebastien", "alexandre", "luis", "angel", 
  "pablo", "adrian", "sergio", "diego", "hugo", "alvaro", "enrique", "ruben", "victor", "raul", "ivan", 
  "oscar", "jesus", "ramon", "joaquin", "mariano", "vicente", "andres", "fernando", "santiago", 
  "roberto", "eduardo", "ricardo", "marcos", "emilio", "julio", "felix", "cesar", "gregorio", "tomas", 
  "alfredo", "arturo", "felipe", "federico", "humberto", "guillermo", "gonzalo", "samuel", "mateo", 
  "lucas", "leo", "enzo", "arthur", "louis", "gabriel", "jules", "paul", "nathan", "theo", "mathis", 
  "malo", "simon", "maxime", "alexis", "antoine", "clement", "romain", "florian", "quentin", "loic", 
  "yann", "olivier", "stephane", "christophe", "vincent", "laurent", "jerome", "didier", "patrick", 
  "christian", "serge", "bernard", "alain", "guy", "marcel", "rene", "robert", "henri", "georges", 
  "guillem", "arnau", "pau", "pol", "nil", "jan", "bernat", "roger", "oriol", "adria", "gerard", "alex"
]);

function InstagramIcon({ size = 16 }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function shortcodeToMediaId(shortcode) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = 0n;
  for (let i = 0; i < shortcode.length; i++) {
    let char = shortcode[i];
    let index = BigInt(alphabet.indexOf(char));
    if (index === -1n) return null;
    id = (id * 64n) + index;
  }
  return id.toString();
}

// Snowflake Background
function SnowflakeBackground() {
  const [flakes, setFlakes] = useState([]);
  useEffect(() => {
    const generatedFlakes = Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 4 + 2; 
      const left = Math.random() * 100; 
      const duration = Math.random() * 12 + 8; 
      const delay = Math.random() * -15; 
      return { id: i, size, left, duration, delay };
    });
    setFlakes(generatedFlakes);
  }, []);
  return (
    <div className="snow-bg">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            width: `${f.size}px`,
            height: `${f.size}px`,
            left: `${f.left}%`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  // --- Persistent Storage State ---
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("hiker_api_key") || "");
  const [demoMode, setDemoMode] = useState(() => !localStorage.getItem("hiker_api_key"));
  const [starredIds, setStarredIds] = useState(() => JSON.parse(localStorage.getItem("starred_likers") || "[]"));
  const [hiddenIds, setHiddenIds] = useState(() => JSON.parse(localStorage.getItem("hidden_likers") || "[]"));
  const [checkedStatus, setCheckedStatus] = useState(() => JSON.parse(localStorage.getItem("checked_status") || "{}"));
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("likers_notes") || "{}"));
  
  const [memories, setMemories] = useState(() => JSON.parse(localStorage.getItem("pinned_memories") || JSON.stringify({
    day: "Saturday (March 14)",
    stage: "Catedral Stage",
    time: "Afternoon (15:00 - 18:00)",
    keywords: "Barcelona, BCN, Toulouse, Andorra, ski",
    outfit: ""
  })));

  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem("snowgirl_targets");
    if (saved) return JSON.parse(saved);
    return [
      { id: "DTkpqYqisnF", url: "https://www.instagram.com/reel/DTkpqYqisnF/", caption: "Recap reel 1", likes: 2500 },
      { id: "DUGiKawis99", url: "https://www.instagram.com/reel/DUGiKawis99/", caption: "Recap reel 2", likes: 1800 }
    ];
  });
  const [selectedTargetId, setSelectedTargetId] = useState(() => targets[0]?.id || "");

  // --- Layout Mode & DB Views ---
  const [layoutMode, setLayoutMode] = useState("facewall"); // 'cards' | 'facewall'
  const [viewMode, setViewMode] = useState("all"); // 'active' (selected post) | 'all' (deduplicated master db)
  const [sortBy, setSortBy] = useState("score"); // 'score' | 'username' | 'default'

  const [filters, setFilters] = useState({
    gender: "female", // 'female' | 'male' | 'all'
    isPrivate: "all", // 'all' | 'public' | 'private'
    isVerified: "all", // 'all' | 'verified' | 'unverified'
    search: "",
    minMutualLikes: 1,
    spanishFilter: "all"
  });

  // Hover states for keyboard shortcuts
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [hoveredUsername, setHoveredUsername] = useState(null);
  const hoveredUserIdRef = useRef(null);
  const hoveredUsernameRef = useRef(null);

  useEffect(() => {
    hoveredUserIdRef.current = hoveredUserId;
  }, [hoveredUserId]);

  useEffect(() => {
    hoveredUsernameRef.current = hoveredUsername;
  }, [hoveredUsername]);

  // --- Dynamic App State ---
  const [searchMode, setSearchMode] = useState("account"); 
  const [viewDataSource, setViewDataSource] = useState("likers"); // 'likers' | 'comments'
  const [usernameInput, setUsernameInput] = useState("elrow");
  const [newTargetInput, setNewTargetInput] = useState("");
  
  // Bulk URL import modal
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkUrlsText, setBulkUrlsText] = useState("");

  // Crawler status
  const [likers, setLikers] = useState(() => {
    return preScrapedUsers && preScrapedUsers.length > 0 ? preScrapedUsers : [];
  });

  useEffect(() => {
    if (preScrapedUsers && preScrapedUsers.length > 0) {
      setLikers(preScrapedUsers);
    }
  }, [preScrapedUsers]);
  const [isFetching, setIsFetching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0); 
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 1000, page: 0 });
  const [isBulkCrawling, setIsBulkCrawling] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hdLoadingIds, setHdLoadingIds] = useState([]);

  // Modals & Banners
  const [selectedLiker, setSelectedLiker] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // References for loops
  const isFetchingRef = useRef(false);
  const isPausedRef = useRef(false);
  const nextCursorRef = useRef(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("hiker_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("starred_likers", JSON.stringify(starredIds));
  }, [starredIds]);

  useEffect(() => {
    localStorage.setItem("hidden_likers", JSON.stringify(hiddenIds));
  }, [hiddenIds]);

  useEffect(() => {
    localStorage.setItem("checked_status", JSON.stringify(checkedStatus));
  }, [checkedStatus]);

  useEffect(() => {
    localStorage.setItem("likers_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("pinned_memories", JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem("snowgirl_targets", JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Load cache when target selection changes
  useEffect(() => {
    if (selectedTargetId && viewMode === "active") {
      loadCacheForTarget(selectedTargetId);
    }
  }, [selectedTargetId, viewMode]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!hoveredUserIdRef.current) return;
      
      const uId = hoveredUserIdRef.current;
      const uName = hoveredUsernameRef.current;
      const key = e.key.toLowerCase();
      
      if (key === 'h') {
        e.preventDefault();
        handleToggleHide(uId);
        showBanner(`Dismissed and hidden @${uName}`, "info");
      } else if (key === 's') {
        e.preventDefault();
        handleToggleStar(uId);
        const isStarred = !starredIds.includes(uId);
        showBanner(isStarred ? `Starred @${uName} ⭐️` : `Unstarred @${uName}`, "info");
      } else if (key === 'm') {
        e.preventDefault();
        handleStatusChange(uId, 'maybe');
        showBanner(`Flagged @${uName} as Maybe 🤔`, "info");
      } else if (key === 'n') {
        e.preventDefault();
        handleStatusChange(uId, 'not_her');
        showBanner(`Marked @${uName} as Not Her ❌`, "info");
      } else if (key === 'c') {
        e.preventDefault();
        handleStatusChange(uId, 'contact');
        showBanner(`Marked @${uName} as Must Contact 📞`, "info");
      } else if (key === 'o') {
        e.preventDefault();
        window.open(`https://instagram.com/${uName}`, "_blank");
      } else if (key === 'd') {
        e.preventDefault();
        window.open(`https://instagram.com/direct/t/${uName}`, "_blank");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [starredIds]);

  // Helper: Banner
  const showBanner = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Cache operations
  const saveCacheForTarget = (targetId, data) => {
    localStorage.setItem(`snowgirl_cache_media_${targetId}`, JSON.stringify(data));
  };

  const loadCacheForTarget = (targetId) => {
    const cached = localStorage.getItem(`snowgirl_cache_media_${targetId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      setLikers(parsed);
      setFetchProgress({
        current: parsed.length,
        total: targets.find(t => t.id === targetId)?.likes || 1000,
        page: Math.ceil(parsed.length / 50)
      });
    } else {
      setLikers([]);
      setFetchProgress({ current: 0, total: targets.find(t => t.id === targetId)?.likes || 1000, page: 0 });
    }
  };

  // Master deduplicated database builder
  const getAllScrapedDeduplicatedUsers = () => {
    const allUsersMap = new Map();
    targets.forEach(t => {
      const cached = localStorage.getItem(`snowgirl_cache_media_${t.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.forEach(user => {
          if (allUsersMap.has(user.pk)) {
            const existing = allUsersMap.get(user.pk);
            if (!existing.likedPostIds.includes(t.id)) {
              existing.likedPostIds.push(t.id);
              existing.likedPostsCount = existing.likedPostIds.length;
              existing.recent_activity += `, Liked "${t.caption || t.id}"`;
            }
          } else {
            allUsersMap.set(user.pk, { 
              ...user,
              likedPostIds: [t.id],
              likedPostsCount: 1,
              recent_activity: `Liked "${t.caption || t.id}"`
            });
          }
        });
      }
    });
    if (allUsersMap.size > 0) {
      return Array.from(allUsersMap.values());
    }
    return likers;
  };

  // Group comments by user and format as suspect profiles
  const getGroupedCommenters = () => {
    const map = new Map();
    const list = preScrapedComments && preScrapedComments.length > 0 ? preScrapedComments : [];
    
    list.forEach(c => {
      const userPk = String(c.pk);
      if (!map.has(userPk)) {
        map.set(userPk, {
          pk: userPk,
          username: c.username,
          full_name: c.full_name,
          profile_pic_url: c.profile_pic_url,
          is_private: c.is_private,
          is_verified: c.is_verified,
          comments: []
        });
      }
      map.get(userPk).comments.push({
        text: c.text,
        post_code: c.post_code,
        post_url: c.post_url,
        created_at: c.created_at
      });
    });
    
    return Array.from(map.values()).map(u => ({
      ...u,
      likedPostsCount: u.comments.length,
      likedPostIds: u.comments.map(c => c.post_code),
      bio: u.comments.map(c => c.text).join(" | "), // Combine comments as bio for keyword filtering
      recent_activity: `Commented: "${u.comments.map(c => c.text).join(", ")}"`
    }));
  };

  // Group location posts by user and format as suspect profiles
  const getLocationPostUsers = () => {
    const map = new Map();
    const list = preScrapedLocationPosts && preScrapedLocationPosts.length > 0 ? preScrapedLocationPosts : [];
    
    list.forEach(item => {
      const userPk = String(item.user.pk);
      if (!map.has(userPk)) {
        map.set(userPk, {
          pk: userPk,
          username: item.user.username,
          full_name: item.user.full_name,
          profile_pic_url: item.user.profile_pic_url,
          is_private: item.user.is_private,
          is_verified: false,
          locationPosts: []
        });
      }
      map.get(userPk).locationPosts.push({
        pk: item.pk,
        code: item.code,
        taken_at: item.taken_at,
        like_count: item.like_count,
        comment_count: item.comment_count,
        post_photo: item.post_photo,
        caption: item.caption,
        location_name: item.location_name
      });
    });
    
    return Array.from(map.values()).map(u => ({
      ...u,
      likedPostsCount: u.locationPosts.length,
      likedPostIds: u.locationPosts.map(p => p.code),
      bio: u.locationPosts.map(p => p.caption).join(" | "), // Combine post captions as bio for keyword filtering
      recent_activity: `Posted at ${u.locationPosts.map(p => p.location_name).join(", ")}`,
      // Use the first post's photo as an override image
      post_photo: u.locationPosts[0]?.post_photo
    }));
  };

  // Bulk add targets URL parser
  const handleImportBulkUrls = () => {
    const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/g;
    let match;
    const codes = [];
    
    while ((match = regex.exec(bulkUrlsText)) !== null) {
      codes.push(match[1]);
    }

    if (codes.length === 0) {
      showBanner("No valid Instagram post or reel URLs detected.", "pink");
      return;
    }

    const newTargets = [...targets];
    let addedCount = 0;
    
    codes.forEach(code => {
      const resolvedId = shortcodeToMediaId(code) || code;
      if (!newTargets.find(t => t.id === resolvedId)) {
        newTargets.push({
          id: resolvedId,
          url: `https://www.instagram.com/reel/${code}/`,
          caption: `Post Code: ${code}`,
          likes: 2000
        });
        addedCount++;
      }
    });

    setTargets(newTargets);
    setBulkUrlsText("");
    setShowBulkAddModal(false);
    if (newTargets.length > 0 && !selectedTargetId) {
      setSelectedTargetId(newTargets[0].id);
    }
    showBanner(`Successfully parsed and added ${addedCount} suspect posts locally!`, "info");
  };

  // Single Add Target
  const handleAddTarget = async () => {
    if (!newTargetInput) return;
    
    let mediaId = newTargetInput.trim();
    let url = newTargetInput.trim();

    setIsLoadingPosts(true);

    if (url.includes("instagram.com")) {
      const codeMatch = url.match(/\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
      const code = codeMatch ? codeMatch[1] : `custom_${Math.floor(Math.random() * 1000)}`;

      const resolvedId = shortcodeToMediaId(code);
      if (resolvedId) {
        const newTarget = {
          id: resolvedId,
          url: url,
          caption: `Post Code: ${code}`,
          likes: 2000
        };
        setTargets(prev => [...prev, newTarget]);
        setSelectedTargetId(resolvedId);
        setNewTargetInput("");
        setIsLoadingPosts(false);
        showBanner("Resolved target URL locally and added!", "info");
        return;
      }

      if (demoMode) {
        setTimeout(() => {
          const newTarget = {
            id: code,
            url: url,
            caption: "Post Code: " + code,
            likes: 1500
          };
          setTargets(prev => [...prev, newTarget]);
          setSelectedTargetId(code);
          setNewTargetInput("");
          setIsLoadingPosts(false);
          showBanner("Demo Mode: Added suspect post target.", "info");
        }, 500);
        return;
      }

      if (!apiKey) {
        showBanner("Please configure your HikerAPI key to resolve Instagram URLs.", "pink");
        setIsLoadingPosts(false);
        return;
      }

      try {
        const res = await fetch(`https://api.hikerapi.com/v1/media/by/url?url=${encodeURIComponent(url)}`, {
          headers: { "x-access-key": apiKey }
        });
        if (!res.ok) throw new Error("Could not resolve post. HTTP " + res.status);
        const data = await res.json();
        
        mediaId = data.id || data.pk;
        const newTarget = {
          id: mediaId,
          url: url,
          caption: data.caption?.text || "Post Code: " + code,
          likes: data.like_count || 1000
        };

        setTargets(prev => [...prev, newTarget]);
        setSelectedTargetId(mediaId);
        setNewTargetInput("");
        showBanner("Target post resolved and added via API!", "info");
      } catch (err) {
        showBanner("Error: " + err.message, "pink");
      } finally {
        setIsLoadingPosts(false);
      }
      return;
    } else {
      const newTarget = {
        id: mediaId,
        url: `https://www.instagram.com/p/${mediaId}/`,
        caption: `Direct ID: ${mediaId}`,
        likes: 1000
      };
      setTargets(prev => [...prev, newTarget]);
      setSelectedTargetId(mediaId);
      setNewTargetInput("");
      setIsLoadingPosts(false);
      showBanner("Direct ID Target Added.", "info");
    }
  };

  const handleRemoveTarget = (id) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    localStorage.removeItem(`snowgirl_cache_media_${id}`);
    if (selectedTargetId === id) {
      const remaining = targets.filter(t => t.id !== id);
      setSelectedTargetId(remaining[0]?.id || "");
    }
    showBanner("Target removed.", "info");
  };

  // Heuristic gender detector
  const detectGender = (fullName = "", username = "") => {
    const combined = `${fullName} ${username}`.toLowerCase();
    const firstWord = fullName.trim().split(/[\s_.-]+/)[0]?.toLowerCase() || "";
    
    if (firstWord) {
      if (FEMALE_NAMES.has(firstWord)) return { gender: "female", confidence: "high", reason: "First name library match" };
      if (MALE_NAMES.has(firstWord)) return { gender: "male", confidence: "high", reason: "First name library match" };
    }

    const femaleEndings = ["a", "ia", "na", "ra", "ca", "la", "ma", "sa", "ta", "va", "za", "ette", "ie"];
    const maleEndings = ["o", "us", "el", "rd", "rt", "on", "an"];

    for (const ending of femaleEndings) {
      if (firstWord.endsWith(ending)) {
        return { gender: "female", confidence: "medium", reason: `Ends in -${ending}` };
      }
    }
    for (const ending of maleEndings) {
      if (firstWord.endsWith(ending)) {
        return { gender: "male", confidence: "medium", reason: `Ends in -${ending}` };
      }
    }

    if (combined.includes("girl") || combined.includes("chic") || combined.includes("lady") || combined.includes("ella")) {
      return { gender: "female", confidence: "high", reason: "Username matching keyword" };
    }

    const secondWord = fullName.trim().split(/[\s_.-]+/)[1]?.toLowerCase() || "";
    if (secondWord && FEMALE_NAMES.has(secondWord)) {
      return { gender: "female", confidence: "medium", reason: "Middle name match" };
    }

    return { gender: "uncertain", confidence: "none", reason: "Inconclusive profile name" };
  };

  // Load account posts
  const handleLoadAccountPosts = async () => {
    setIsLoadingPosts(true);
    setPosts([]);

    if (demoMode) {
      setTimeout(() => {
        const filteredMockPosts = mockPosts.filter(p => p.account.toLowerCase().includes(usernameInput.toLowerCase()));
        setPosts(filteredMockPosts.length > 0 ? filteredMockPosts : mockPosts);
        setIsLoadingPosts(false);
        showBanner("Demo Mode: Loaded simulated posts from @" + usernameInput, "info");
      }, 600);
      return;
    }

    if (!apiKey) {
      showBanner("Please configure your HikerAPI key first, or switch to Demo Mode.", "pink");
      setIsLoadingPosts(false);
      return;
    }

    try {
      const userRes = await fetch(`https://api.hikerapi.com/v1/user/by/username?username=${usernameInput}`, {
        headers: { "x-access-key": apiKey }
      });
      if (!userRes.ok) throw new Error("Account search failed (Status: " + userRes.status + ")");
      const userData = await userRes.json();
      
      const userId = userData.pk || userData.id;
      if (!userId) throw new Error("Could not find Instagram user ID for " + usernameInput);

      const mediaRes = await fetch(`https://api.hikerapi.com/v1/user/medias/chunk?user_id=${userId}`, {
        headers: { "x-access-key": apiKey }
      });
      if (!mediaRes.ok) throw new Error("Medias request failed");
      const mediaData = await mediaRes.json();

      const items = mediaData.items || [];
      const formattedPosts = items.map(p => ({
        id: p.id || p.pk,
        url: `https://www.instagram.com/p/${p.code}/`,
        thumbnail: p.thumbnail_url || (p.image_versions2?.candidates?.[0]?.url) || "",
        caption: p.caption?.text || "",
        like_count: p.like_count || 0,
        comments_count: p.comment_count || 0,
        date: p.taken_at ? new Date(p.taken_at * 1000).toISOString().split('T')[0] : "",
        account: usernameInput
      }));

      setPosts(formattedPosts);
      showBanner(`Loaded ${formattedPosts.length} posts for @${usernameInput}`, "info");
    } catch (err) {
      showBanner("Error: " + err.message, "pink");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSelectSearchedPost = (post) => {
    const exists = targets.find(t => t.id === post.id);
    if (exists) {
      setSelectedTargetId(post.id);
      showBanner("Post already added. Selected target.", "info");
      return;
    }

    const newTarget = {
      id: post.id,
      url: post.url,
      caption: post.caption || `Post by ${post.account}`,
      likes: post.like_count || 1000
    };
    
    setTargets(prev => [...prev, newTarget]);
    setSelectedTargetId(post.id);
    setPosts([]);
    showBanner("Added searched post to suspect list!", "info");
  };

  // --- Crawler Logic Loop ---
  const startCrawler = async (targetId, totalLikes) => {
    if (isFetching) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setIsPaused(false);
    
    let baseList = [];
    const cachedData = localStorage.getItem(`snowgirl_cache_media_${targetId}`);
    if (cachedData && likers.length > 0) {
      if (!window.confirm("Do you want to append new profiles to your existing cache, or restart from scratch?")) {
        baseList = [];
        setLikers([]);
        localStorage.removeItem(`snowgirl_cache_media_${targetId}`);
      } else {
        baseList = JSON.parse(cachedData);
      }
    }

    nextCursorRef.current = null;
    setFetchProgress({
      current: baseList.length,
      total: totalLikes || 1000,
      page: Math.ceil(baseList.length / 50)
    });

    if (demoMode) {
      runDemoCrawlerLoop(targetId, baseList);
      return;
    }

    runLiveCrawlerLoop(targetId, baseList);
  };

  // Simulated crawler (Demo)
  const runDemoCrawlerLoop = async (targetId, baseList) => {
    let currentList = [...baseList];
    const batchSize = 10;
    const pages = 4;
    
    for (let page = 1; page <= pages; page++) {
      while (isPausedRef.current) {
        if (!isFetchingRef.current) return;
        await new Promise(r => setTimeout(r, 200));
      }
      if (!isFetchingRef.current) return;

      await new Promise(r => setTimeout(r, 1200));
      
      const startIdx = (page - 1) * batchSize;
      const endIdx = startIdx + batchSize;
      const pageUsers = mockUsers.slice(startIdx, endIdx);
      
      currentList = [...currentList, ...pageUsers];
      
      setLikers(currentList);
      saveCacheForTarget(targetId, currentList);
      
      setFetchProgress(prev => ({
        ...prev,
        current: currentList.length,
        page: page
      }));

      showBanner(`[Demo Mode] Crawled page ${page}/${pages} (Fetched ${currentList.length} users)`, "info");
    }

    setIsFetching(false);
    showBanner("Simulated crawl finished. Cache saved.", "info");
  };

  // Live crawler (HikerAPI)
  const runLiveCrawlerLoop = async (mediaId, baseList) => {
    let currentList = [...baseList];
    let pageCount = Math.ceil(currentList.length / 50);
    let hasMore = true;
    let retryCount = 0;
    const maxRetries = 5;

    try {
      while (hasMore && isFetchingRef.current) {
        while (isPausedRef.current) {
          if (!isFetchingRef.current) return;
          await new Promise(r => setTimeout(r, 200));
        }

        let url = `https://api.hikerapi.com/v2/media/likers?id=${mediaId}`;
        if (nextCursorRef.current) {
          url += `&next_page_id=${encodeURIComponent(nextCursorRef.current)}`;
        }

        const res = await fetch(url, {
          headers: { "x-access-key": apiKey }
        });
        
        if (res.status === 429) {
          showBanner("API Rate Limit (429) hit! Auto-pausing for 60 seconds...", "pink");
          setIsPaused(true);
          for (let c = 60; c > 0; c--) {
            setCountdown(c);
            await new Promise(r => setTimeout(r, 1000));
            if (!isFetchingRef.current) return;
          }
          setCountdown(0);
          setIsPaused(false);
          retryCount++;
          if (retryCount > maxRetries) {
            showBanner("Too many rate limits. Crawler stopped.", "pink");
            break;
          }
          continue; 
        }
        
        if (!res.ok) throw new Error("HTTP " + res.status + " error while crawling likers");

        retryCount = 0; 
        const data = await res.json();
        const rawUsers = data.users || data.items || [];
        
        if (rawUsers.length === 0) {
          hasMore = false;
          break;
        }

        const formatted = rawUsers.map(u => ({
          pk: u.pk || u.id || u.user_pk,
          username: u.username,
          full_name: u.full_name || "",
          profile_pic_url: u.profile_pic_url || "",
          is_private: !!u.is_private,
          is_verified: !!u.is_verified,
          bio: u.biography || u.bio || "",
          recent_activity: "Liked post"
        }));

        currentList = [...currentList, ...formatted];
        pageCount++;
        
        nextCursorRef.current = data.next_page_id || null;
        hasMore = !!data.more_available && !!nextCursorRef.current;

        setLikers(currentList);
        saveCacheForTarget(mediaId, currentList);
        
        setFetchProgress(prev => ({
          ...prev,
          current: currentList.length,
          page: pageCount
        }));

        await new Promise(r => setTimeout(r, 1800));
      }
      
      showBanner(`Crawl complete! Scraped ${currentList.length} users into cached dashboard.`, "info");
    } catch (err) {
      showBanner("Crawler encountered an error: " + err.message, "pink");
    } finally {
      setIsFetching(false);
      setCountdown(0);
    }
  };

  // --- Bulk Target Scraper Loop ---
  const runBulkCrawl = async () => {
    if (isBulkCrawling) {
      setIsBulkCrawling(false);
      setIsFetching(false);
      return;
    }

    const unresolvedTargets = targets.filter(t => !localStorage.getItem(`snowgirl_cache_media_${t.id}`));
    const finalTargets = unresolvedTargets.length > 0 ? unresolvedTargets : targets;

    if (unresolvedTargets.length === 0) {
      if (!window.confirm("All suspect posts already have cached profiles. Do you want to recrawl all 27 posts?")) {
        return;
      }
    }

    setIsBulkCrawling(true);
    setIsFetching(true);
    setIsPaused(false);
    setCountdown(0);
    
    setBulkProgress({ current: 0, total: finalTargets.length });

    let index = 0;
    for (const target of finalTargets) {
      if (!isFetchingRef.current) break;
      
      setBulkProgress(prev => ({ ...prev, current: index + 1 }));
      setSelectedTargetId(target.id);
      showBanner(`[Bulk Mode] Scrape starting for post ${index + 1} of ${finalTargets.length}: ${target.id}`, "info");

      nextCursorRef.current = null;
      let currentList = [];
      let hasMore = true;
      let retryCount = 0;

      while (hasMore && isFetchingRef.current) {
        while (isPausedRef.current) {
          if (!isFetchingRef.current) break;
          await new Promise(r => setTimeout(r, 200));
        }
        if (!isFetchingRef.current) break;

        let url = `https://api.hikerapi.com/v2/media/likers?id=${target.id}`;
        if (nextCursorRef.current) {
          url += `&next_page_id=${encodeURIComponent(nextCursorRef.current)}`;
        }

        if (demoMode) {
          await new Promise(r => setTimeout(r, 600));
          const mockPage = mockUsers.slice(0, 10);
          currentList = [...currentList, ...mockPage];
          setLikers(currentList);
          saveCacheForTarget(target.id, currentList);
          hasMore = false; 
          break;
        }

        try {
          const res = await fetch(url, {
            headers: { "x-access-key": apiKey }
          });

          if (res.status === 429) {
            showBanner(`[Bulk Mode] Rate limit hit. Waiting 60s...`, "pink");
            setIsPaused(true);
            for (let c = 60; c > 0; c--) {
              setCountdown(c);
              await new Promise(r => setTimeout(r, 1000));
              if (!isFetchingRef.current) break;
            }
            setCountdown(0);
            setIsPaused(false);
            retryCount++;
            if (retryCount > 5) break;
            continue; 
          }

          if (!res.ok) throw new Error("HTTP " + res.status);

          retryCount = 0;
          const data = await res.json();
          const rawUsers = data.users || data.items || [];

          if (rawUsers.length === 0) {
            hasMore = false;
            break;
          }

          const formatted = rawUsers.map(u => ({
            pk: u.pk || u.id || u.user_pk,
            username: u.username,
            full_name: u.full_name || "",
            profile_pic_url: u.profile_pic_url || "",
            is_private: !!u.is_private,
            is_verified: !!u.is_verified,
            bio: u.biography || u.bio || "",
            recent_activity: `Liked post ${target.id}`
          }));

          currentList = [...currentList, ...formatted];
          nextCursorRef.current = data.next_page_id || null;
          hasMore = !!data.more_available && !!nextCursorRef.current;

          setLikers(currentList);
          saveCacheForTarget(target.id, currentList);

          await new Promise(r => setTimeout(r, 1800));
        } catch (err) {
          showBanner(`[Bulk Mode] Skip target ${target.id}: ${err.message}`, "pink");
          break;
        }
      }
      index++;
    }

    setIsFetching(false);
    setIsBulkCrawling(false);
    showBanner(`Bulk crawl process completed. Scraped ${finalTargets.length} posts.`, "info");
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleStopCrawler = () => {
    setIsFetching(false);
    setIsPaused(false);
    setIsBulkCrawling(false);
    setCountdown(0);
  };

  // Memory tags
  const toggleMemoryTag = (keyword) => {
    const existing = memories.keywords.split(",").map(k => k.trim()).filter(Boolean);
    const index = existing.findIndex(k => k.toLowerCase() === keyword.toLowerCase());
    
    if (index > -1) {
      existing.splice(index, 1);
    } else {
      existing.push(keyword);
    }
    
    setMemories(prev => ({ ...prev, keywords: existing.join(", ") }));
  };

  // Star & Hide
  const handleToggleStar = (userId) => {
    setStarredIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleHide = (userId) => {
    setHiddenIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Status Labels
  const handleStatusChange = (userId, status) => {
    setCheckedStatus(prev => ({
      ...prev,
      [userId]: status === "none" ? undefined : status
    }));
  };

  // Notes
  const handleNotesChange = (userId, text) => {
    setNotes(prev => ({ ...prev, [userId]: text }));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      gender: "female",
      isPrivate: "all",
      isVerified: "all",
      search: "",
      minMutualLikes: 1,
      spanishFilter: "all"
    });
    setSortBy("score");
  };

  // Fetch HD profile picture from HikerAPI on demand
  const handleFetchHDPhoto = async (user) => {
    if (!apiKey) {
      showBanner("Please configure your HikerAPI key to fetch HD photos.", "pink");
      return;
    }
    
    setHdLoadingIds(prev => [...prev, user.pk]);
    
    try {
      const res = await fetch(`https://api.hikerapi.com/v1/user/by/username?username=${user.username}`, {
        headers: { "x-access-key": apiKey }
      });
      if (!res.ok) throw new Error("API Error: HTTP " + res.status);
      const data = await res.json();
      
      const hdUrl = data.profile_pic_url || data.profile_pic_url_hd;
      if (hdUrl) {
        const savedOverrides = JSON.parse(localStorage.getItem("hd_pic_overrides") || "{}");
        savedOverrides[user.pk] = hdUrl;
        localStorage.setItem("hd_pic_overrides", JSON.stringify(savedOverrides));
        
        // Update local state to trigger rerender
        setLikers(prev => prev.map(u => u.pk === user.pk ? { ...u, profile_pic_url: hdUrl } : u));
        
        showBanner(`Successfully loaded HD photo for @${user.username}!`, "info");
      } else {
        showBanner("Could not find HD photo URL in API response.", "pink");
      }
    } catch (err) {
      showBanner("Failed to load HD photo: " + err.message, "pink");
    } finally {
      setHdLoadingIds(prev => prev.filter(id => id !== user.pk));
    }
  };

  // Data processing pipeline
  const getProcessedLikers = () => {
    // Select correct database source
    const list = viewDataSource === "location"
      ? getLocationPostUsers()
      : (viewDataSource === "comments"
          ? getGroupedCommenters()
          : (viewMode === "all" 
              ? getAllScrapedDeduplicatedUsers()
              : (likers.length > 0 ? likers : (demoMode ? mockUsers : []))));
    
    const keywordArray = memories.keywords.split(",")
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 1);

    const hdOverrides = JSON.parse(localStorage.getItem("hd_pic_overrides") || "{}");

    const processed = list.map(user => {
      const detect = detectGender(user.full_name, user.username);
      const isStarred = starredIds.includes(user.pk);
      const isHidden = hiddenIds.includes(user.pk);
      const status = checkedStatus[user.pk] || "none";
      const note = notes[user.pk] || "";
      const likedPostsCount = user.likedPostsCount || 1;
      const likedPostIds = user.likedPostIds || [selectedTargetId];
      
      const overrodeUrl = hdOverrides[user.pk];
      const profile_pic_url = overrodeUrl || user.profile_pic_url;
      
      let keywordHits = [];
      const bioText = (user.bio || "").toLowerCase();
      const nameText = `${user.full_name} ${user.username}`.toLowerCase();
      
      keywordArray.forEach(kw => {
        if (bioText.includes(kw) || nameText.includes(kw)) {
          keywordHits.push(kw);
        }
      });

      // Match score calculation
      let score = keywordHits.length * 5 + (likedPostsCount - 1) * 10;
      if (detect.gender === 'female') score += 2;
      if (status === 'maybe') score += 50;
      if (status === 'contact') score += 100;

      return {
        ...user,
        profile_pic_url,
        genderInfo: detect,
        isStarred,
        isHidden,
        status,
        note,
        keywordHits,
        likedPostsCount,
        likedPostIds,
        matchScore: score
      };
    });

    if (sortBy === "score") {
      processed.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "username") {
      processed.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === "likes_count") {
      processed.sort((a, b) => b.likedPostsCount - a.likedPostsCount);
    }

    return processed;
  };

  const filteredLikers = getProcessedLikers().filter(user => {
    if (user.isHidden) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch = user.username.toLowerCase().includes(q) || user.full_name.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (filters.gender !== "all") {
      if (filters.gender === "female" && user.genderInfo.gender !== "female") return false;
      if (filters.gender === "female_and_uncertain" && user.genderInfo.gender !== "female" && user.genderInfo.gender !== "uncertain") return false;
      if (filters.gender === "uncertain" && user.genderInfo.gender !== "uncertain") return false;
      if (filters.gender === "male" && user.genderInfo.gender !== "male") return false;
    }

    if (filters.isPrivate !== "all") {
      if (filters.isPrivate === "private" && !user.is_private) return false;
      if (filters.isPrivate === "public" && user.is_private) return false;
    }

    if (filters.isVerified !== "all") {
      if (filters.isVerified === "verified" && !user.is_verified) return false;
      if (filters.isVerified === "unverified" && user.is_verified) return false;
    }

    if (filters.minMutualLikes && user.likedPostsCount < filters.minMutualLikes) {
      return false;
    }

    if (filters.spanishFilter === "spanish") {
      const fullName = (user.full_name || '').toLowerCase();
      const firstWord = fullName.trim().split(/[\s_.-]+/)[0] || '';
      if (!SPANISH_FEMALE_NAMES.has(firstWord)) {
        return false;
      }
    } else if (filters.spanishFilter === "exclude") {
      const fullName = (user.full_name || '').toLowerCase();
      const firstWord = fullName.trim().split(/[\s_.-]+/)[0] || '';
      if (SPANISH_FEMALE_NAMES.has(firstWord)) {
        return false;
      }
    }

    return true;
  });

  // Export starred data
  const handleExportData = () => {
    const starredFullData = getProcessedLikers().filter(u => u.isStarred || u.status === "maybe" || u.status === "contact");
    if (starredFullData.length === 0) {
      showBanner("No starred matches to export. Please star some accounts first.", "pink");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      version: "1.0",
      exportDate: new Date().toISOString(),
      pinnedMemories: memories,
      starredMatches: starredFullData.map(u => ({
        pk: u.pk,
        username: u.username,
        full_name: u.full_name,
        profile_url: `https://instagram.com/${u.username}`,
        direct_message_url: `https://instagram.com/direct/t/${u.username}`,
        is_private: u.is_private,
        status: u.status,
        note: u.note,
        bio: u.bio
      }))
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `snowgirl_matches_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showBanner("Successfully exported your starred list!", "info");
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.starredMatches) {
          const newStarred = [];
          const newChecked = { ...checkedStatus };
          const newNotes = { ...notes };
          
          imported.starredMatches.forEach(u => {
            newStarred.push(u.pk);
            if (u.status && u.status !== 'none') newChecked[u.pk] = u.status;
            if (u.note) newNotes[u.pk] = u.note;
          });

          setStarredIds(prev => Array.from(new Set([...prev, ...newStarred])));
          setCheckedStatus(newChecked);
          setNotes(newNotes);
          if (imported.pinnedMemories) setMemories(imported.pinnedMemories);
          
          showBanner("Successfully imported backup match data!", "info");
        } else {
          showBanner("Invalid backup file format.", "pink");
        }
      } catch (err) {
        showBanner("Error parsing: " + err.message, "pink");
      }
    };
    fileReader.readAsText(e.target.files[0]);
  };

  const handleCopyClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showBanner("Copied link!", "info");
  };

  const activeTarget = targets.find(t => t.id === selectedTargetId);

  return (
    <>
      <SnowflakeBackground />
      
      {/* Banner Notification */}
      {notification && (
        <div className={`notification-banner ${notification.type === 'pink' ? 'pink' : ''}`}>
          <div className="flex items-center gap-2">
            <Info size={16} />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="modal-close" style={{ position: 'relative', top: 0, right: 0, width: 24, height: 24 }}>✕</button>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon-container">
            <Heart />
          </div>
          <div className="app-title-container">
            <h1 className="app-title">Snowgirl Finder</h1>
            <p className="app-subtitle">Snowrow 2026 Missed Connection Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className={`btn ${demoMode ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => {
              setDemoMode(prev => !prev);
              showBanner(demoMode ? "Switched to API Mode. Please check token." : "Switched to Demo Mode (Mock data active).", "info");
            }}
          >
            <Sparkles size={16} />
            <span>{demoMode ? "Demo Mode Active" : "Live API Mode"}</span>
          </button>
          
          <button 
            className="btn btn-secondary btn-icon-only"
            onClick={() => setShowSettings(prev => !prev)}
            title="API Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* API Config Panel */}
      {showSettings && (
        <div className="glass-panel" style={{ marginTop: '20px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
          <h2 className="sidebar-title cyan"><Key size={16} /> HikerAPI Connection Config</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Enter your HikerAPI Access Key below. This key is used to resolve Instagram profile IDs and crawl post likes.
          </p>
          
          <div className="form-group">
            <label className="form-label">HikerAPI Token (`x-access-key`)</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Paste key here..." 
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (e.target.value) setDemoMode(false);
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => { setShowSettings(false); showBanner("API Config Saved!", "info"); }}>
              Save & Close
            </button>
            <button className="btn btn-secondary" onClick={() => { setApiKey(""); setDemoMode(true); showBanner("Cleared key. Demo Mode active.", "info"); }}>
              Clear Key
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div className="sidebar-section">
          
          {/* Target List Panel (Suspect Posts Manager) */}
          <div className="glass-panel glow-cyan">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 className="sidebar-title cyan" style={{ marginBottom: 0 }}><Tag size={16} /> Target Posts</h2>
              <button 
                className="btn btn-accent" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setShowBulkAddModal(true)}
              >
                Bulk Import
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Add suspect post URLs or IDs. Switch targets below to inspect their profiles.
            </p>

            {/* List of current targets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
              {targets.map(t => (
                <div 
                  key={t.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: selectedTargetId === t.id && viewMode === 'active' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid',
                    borderColor: selectedTargetId === t.id && viewMode === 'active' ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setSelectedTargetId(t.id); setViewMode("active"); }}
                >
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.caption}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      ID: {t.id.substring(0,8)}...
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {localStorage.getItem(`snowgirl_cache_media_${t.id}`) && (
                      <span style={{ fontSize: '9px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)', padding: '1px 3px', borderRadius: '3px' }}>Scraped</span>
                    )}
                    <button 
                      className="btn btn-secondary btn-icon-only" 
                      style={{ width: '22px', height: '22px', padding: 0 }}
                      onClick={(e) => { e.stopPropagation(); handleRemoveTarget(t.id); }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add target */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flexGrow: 1, fontSize: '13px', padding: '8px 10px' }}
                  placeholder="Paste URL or Post ID..." 
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTarget()}
                />
                <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={handleAddTarget}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Pinned Memories Panel */}
          <div className="glass-panel glow-pink">
            <h2 className="sidebar-title pink"><BookOpen size={16} /> Pinned Memories</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Bios containing these words will score higher and float to the top!
            </p>

            <div className="form-group">
              <label className="form-label">Festival Day</label>
              <select 
                className="form-input"
                value={memories.day}
                onChange={(e) => setMemories(prev => ({ ...prev, day: e.target.value }))}
              >
                <option>Thursday (March 12)</option>
                <option>Friday (March 13)</option>
                <option>Saturday (March 14)</option>
                <option>Sunday (March 15)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Stage</label>
              <select 
                className="form-input"
                value={memories.stage}
                onChange={(e) => setMemories(prev => ({ ...prev, stage: e.target.value }))}
              >
                <option>Catedral Stage (Rowshow)</option>
                <option>Brunch Electronik Stage</option>
                <option>Pas de la Casa (Slopes)</option>
                <option>Grau Roig (Slopes)</option>
                <option>Other / Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bio Keywords (Comma-split)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Barcelona, BCN, Toulouse" 
                value={memories.keywords}
                onChange={(e) => setMemories(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>

            {/* Quick Suggest tags */}
            <div className="tag-selector">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', width: '100%' }}>Quick add tags:</span>
              {["Barcelona", "BCN", "Toulouse", "Andorra", "Ski", "Snowboard", "Techno", "elrow", "Brunch"].map((tag) => {
                const isActive = memories.keywords.toLowerCase().includes(tag.toLowerCase());
                return (
                  <button 
                    key={tag} 
                    onClick={() => toggleMemoryTag(tag)}
                    className={`tag-btn ${isActive ? 'active pink' : ''}`}
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                  >
                    {isActive ? "✓ " : "+ "} {tag}
                  </button>
                );
              })}
            </div>

            <div className="form-group" style={{ marginTop: '14px', marginBottom: 0 }}>
              <label className="form-label">Outfit / Physical Notes</label>
              <textarea 
                className="form-input" 
                rows="2"
                style={{ resize: 'none', height: '50px', fontSize: '13px' }}
                placeholder="e.g. Pink ski suit, white beanie..." 
                value={memories.outfit}
                onChange={(e) => setMemories(prev => ({ ...prev, outfit: e.target.value }))}
              />
            </div>
          </div>

          {/* Backup / Restore State */}
          <div className="glass-panel">
            <h2 className="sidebar-title yellow"><Tag size={16} /> Backup & Database</h2>
            
            <div className="flex flex-col gap-2">
              <button className="btn btn-secondary w-full" onClick={handleExportData} style={{ justifyContent: 'flex-start' }}>
                <Download size={16} />
                <span>Export Starred Connection Data</span>
              </button>
              
              <label className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', cursor: 'pointer' }}>
                <Upload size={16} />
                <span>Import Backup</span>
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  onChange={handleImportData}
                />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Target Crawler Engine */}
          <div className="glass-panel glow-cyan">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 className="sidebar-title cyan" style={{ margin: 0 }}><Search size={16} /> Crawl Control Panel</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn ${isBulkCrawling ? 'btn-secondary' : 'btn-accent'}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={runBulkCrawl}
                >
                  {isBulkCrawling ? "Cancel Bulk Scrape" : `Crawl All Targets (${targets.length})`}
                </button>
              </div>
            </div>

            {activeTarget ? (
              <div>
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(255, 255, 255, 0.01)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{activeTarget.caption}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Post ID: <code>{activeTarget.id}</code> • Est. Likes: {activeTarget.likes.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {localStorage.getItem(`snowgirl_cache_media_${activeTarget.id}`) && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => clearCacheForTarget(activeTarget.id)}
                        disabled={isFetching}
                      >
                        Clear Cache
                      </button>
                    )}
                    <button 
                      className={`btn ${isFetching ? 'btn-secondary' : 'btn-pink'}`}
                      onClick={() => startCrawler(activeTarget.id, activeTarget.likes)}
                      disabled={isBulkCrawling}
                    >
                      {isFetching && !isBulkCrawling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                      <span>{isFetching && !isBulkCrawling ? "Stop Crawl" : (localStorage.getItem(`snowgirl_cache_media_${activeTarget.id}`) ? "Recrawl Likes" : "Crawl Likes")}</span>
                    </button>
                  </div>
                </div>

                {/* Live Scraper Progress Indicator */}
                {isFetching && (
                  <div className="progress-panel" style={{ padding: '16px', marginTop: '16px' }}>
                    <div className="progress-header">
                      <div className="progress-title">
                        {isBulkCrawling 
                          ? `[Bulk Crawl Mode] Crawling target ${bulkProgress.current} of ${bulkProgress.total}...`
                          : (isPaused 
                            ? (countdown > 0 ? `Rate Limit Safety Pause (Retrying in ${countdown}s)` : "Pausing crawler...") 
                            : "Crawling Instagram engagement API...")}
                      </div>
                      <div className="progress-percent">
                        {fetchProgress.current} profiles crawled
                      </div>
                    </div>

                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(100, (fetchProgress.current / fetchProgress.total) * 100)}%` }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button className="btn btn-secondary" onClick={handleTogglePause} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        <span>{isPaused ? "Resume Scan" : "Pause Scan"}</span>
                      </button>
                      <button className="btn btn-danger" onClick={handleStopCrawler} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <RotateCcw size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '30px' }}>
                <AlertCircle className="empty-state-icon" />
                <h3 className="empty-state-title">No suspect posts added</h3>
                <p className="empty-state-desc">Add an Instagram post ID/URL in the sidebar manager to start scanning.</p>
              </div>
            )}
          </div>

          {/* GALLERY AREA */}
          <div className="glass-panel">
            
            {/* Filter & View Console */}
            <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Data Source Selector */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button 
                    className="btn"
                    onClick={() => setViewDataSource("likers")}
                    style={{ 
                      padding: '8px 14px', 
                      fontSize: '13px', 
                      border: 'none', 
                      borderRadius: '6px',
                      background: viewDataSource === 'likers' ? 'var(--neon-pink)' : 'transparent', 
                      color: 'white',
                      fontWeight: viewDataSource === 'likers' ? 'bold' : 'normal',
                      boxShadow: viewDataSource === 'likers' ? 'var(--shadow-neon-pink)' : 'none'
                    }}
                  >
                    ❤️ Likers DB
                  </button>
                  <button 
                    className="btn"
                    onClick={() => setViewDataSource("comments")}
                    style={{ 
                      padding: '8px 14px', 
                      fontSize: '13px', 
                      border: 'none', 
                      borderRadius: '6px',
                      background: viewDataSource === 'comments' ? 'var(--neon-pink)' : 'transparent', 
                      color: 'white',
                      fontWeight: viewDataSource === 'comments' ? 'bold' : 'normal',
                      boxShadow: viewDataSource === 'comments' ? 'var(--shadow-neon-pink)' : 'none'
                    }}
                  >
                    💬 Commenters DB
                  </button>
                  <button 
                    className="btn"
                    onClick={() => setViewDataSource("location")}
                    style={{ 
                      padding: '8px 14px', 
                      fontSize: '13px', 
                      border: 'none', 
                      borderRadius: '6px',
                      background: viewDataSource === 'location' ? 'var(--neon-cyan)' : 'transparent', 
                      color: viewDataSource === 'location' ? 'black' : 'white',
                      fontWeight: viewDataSource === 'location' ? 'bold' : 'normal',
                      boxShadow: viewDataSource === 'location' ? 'var(--shadow-neon-cyan)' : 'none'
                    }}
                  >
                    📍 Location DB
                  </button>
                </div>
                
                {/* Divider */}
                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>

                {/* Database view switch */}
                <button 
                  className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode("all")}
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  Show Merged (Deduplicated Master DB)
                </button>
                <button 
                  className={`btn ${viewMode === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode("active")}
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  Show Active Target Only ({activeTarget?.caption || "None"})
                </button>
                
                {/* 📊 Total profiles display badge */}
                <span className="badge badge-confident" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold' }}>
                  🔍 {filteredLikers.length.toLocaleString()} matching profiles
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Layout Mode Toggle */}
                <button 
                  className="btn btn-secondary btn-icon-only"
                  onClick={() => setLayoutMode(prev => prev === 'facewall' ? 'cards' : 'facewall')}
                  title={layoutMode === 'facewall' ? "Switch to standard cards layout" : "Switch to big photo wall layout"}
                  style={{ width: '34px', height: '34px' }}
                >
                  {layoutMode === 'facewall' ? <Grid size={16} /> : <User size={16} />}
                </button>

                {/* Sorting */}
                <select 
                  className="form-input" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '13px', height: '34px' }}
                >
                  <option value="score">Sort: Match Score (Memories)</option>
                  <option value="likes_count">Sort: Most Mutual Likes</option>
                  <option value="username">Sort: Alphabetical (A-Z)</option>
                  <option value="default">Sort: Default Scraped</option>
                </select>

                <button className="btn btn-secondary" onClick={handleResetFilters} style={{ padding: '6px 12px', fontSize: '12px', height: '34px' }}>
                  Reset Filters
                </button>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px',
              background: 'rgba(0,0,0,0.2)',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {/* Filter 1: Gender Heuristics */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender (Name Classifier)</label>
                <select 
                  className="form-input"
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="female">Likely Female (Strict library match)</option>
                  <option value="female_and_uncertain">Likely Female + Unclassified/Uncertain (Broad)</option>
                  <option value="uncertain">Unclassified/Uncertain Only</option>
                  <option value="male">Likely Male Only</option>
                  <option value="all">Show All Attendees (No Filter)</option>
                </select>
              </div>

              {/* Filter 2: Account Privacy */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Profile Privacy</label>
                <select 
                  className="form-input"
                  value={filters.isPrivate}
                  onChange={(e) => setFilters(prev => ({ ...prev, isPrivate: e.target.value }))}
                >
                  <option value="all">All Profiles</option>
                  <option value="public">Public Only (Searchable)</option>
                  <option value="private">Private Only</option>
                </select>
              </div>

              {/* Filter 3: Minimum Mutual Likes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Min Mutual Likes Match</label>
                <select 
                  className="form-input"
                  value={filters.minMutualLikes}
                  onChange={(e) => setFilters(prev => ({ ...prev, minMutualLikes: parseInt(e.target.value) }))}
                >
                  <option value={1}>Show All (1+ Likes)</option>
                  <option value={2}>Liked at least 2 targets</option>
                  <option value={3}>Liked at least 3 targets</option>
                  <option value={4}>Liked at least 4 targets</option>
                  <option value={5}>Liked at least 5 targets</option>
                </select>
              </div>

              {/* Filter 4: Spanish Origin */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Spanish Name Filter</label>
                <select 
                  className="form-input"
                  value={filters.spanishFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, spanishFilter: e.target.value }))}
                >
                  <option value="all">All Nationalities</option>
                  <option value="spanish">Likely Spanish Names Only 🇪🇸</option>
                  <option value="exclude">Exclude Spanish Names 🚫🇪🇸</option>
                </select>
              </div>

              {/* Filter 5: Search Bar */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Username/Fullname</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input w-full" 
                    style={{ paddingLeft: '28px' }}
                    placeholder="Search name..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Empty state */}
            {filteredLikers.length === 0 ? (
              <div className="empty-state">
                <User className="empty-state-icon" />
                <h3 className="empty-state-title">No matching attendees found</h3>
                <p className="empty-state-desc">
                  Try adjusting filters or trigger a new crawl.
                </p>
              </div>
            ) : (
              /* Grid Layout Selection */
              layoutMode === "facewall" ? (
                /* 🌟 FACE WALL VISUAL VIEWER 🌟 */
                <div className="facewall-grid">
                  {filteredLikers.map((user) => {
                    const isFemale = user.genderInfo.gender === 'female';
                    const isHovered = hoveredUserId === user.pk;
                    
                    return (
                      <div 
                        key={user.pk} 
                        className={`facewall-card ${isHovered ? 'hovered' : ''} ${isFemale ? 'glow-pink' : ''}`}
                        onMouseEnter={() => { setHoveredUserId(user.pk); setHoveredUsername(user.username); }}
                        onMouseLeave={() => { setHoveredUserId(null); setHoveredUsername(null); }}
                      >
                        {/* Badges on picture */}
                        <div className="facewall-badges">
                          <button 
                            className="facewall-badge-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFetchHDPhoto(user);
                            }}
                            title="Load High Definition Profile Picture"
                            style={{ 
                              background: 'var(--neon-cyan)', 
                              color: 'black', 
                              borderColor: 'var(--neon-cyan)', 
                              fontWeight: 'bold', 
                              fontSize: '9px',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px'
                            }}
                            disabled={hdLoadingIds.includes(user.pk)}
                          >
                            {hdLoadingIds.includes(user.pk) ? "⏳" : "HD"}
                          </button>
                          {user.likedPostsCount > 1 && (
                            <div className="facewall-badge-icon" style={{ background: 'var(--neon-pink)', color: 'white', borderColor: 'var(--neon-pink)', fontWeight: 'bold' }} title={`Liked ${user.likedPostsCount} target posts`}>
                              {user.likedPostsCount}
                            </div>
                          )}
                          {user.isStarred && <div className="facewall-badge-icon starred">★</div>}
                          {user.status === 'maybe' && <div className="facewall-badge-icon maybe">🤔</div>}
                          {user.status === 'contact' && <div className="facewall-badge-icon contact">📞</div>}
                          {isFemale && <div className="facewall-badge-icon female" title="Likely Female">♀</div>}
                        </div>

                        <div className="facewall-img-container">
                          <img 
                            src={getProxiedImageUrl(user.post_photo || user.profile_pic_url)} 
                            className="facewall-img" 
                            alt="" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="facewall-avatar-fallback">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                        </div>

                        <div className="facewall-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <span className="facewall-username" style={{ margin: 0 }}>@{user.username}</span>
                            <button 
                              className="btn-copy-username" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                navigator.clipboard.writeText(user.username);
                                showBanner(`Copied @${user.username} to clipboard!`, "info");
                              }}
                              title="Copy username"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: 0, 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)', 
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <span className="facewall-fullname">{user.full_name || "Instagram User"}</span>
                          {user.comments && user.comments.length > 0 && (
                            <div className="facewall-comment-preview" style={{ 
                              fontSize: '10.5px', 
                              color: 'var(--neon-pink)', 
                              marginTop: '4px', 
                              fontStyle: 'italic', 
                              overflow: 'hidden', 
                              textSpread: 'nowrap',
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              width: '100%',
                              textAlign: 'center',
                              padding: '0 4px'
                            }} title={user.comments[0].text}>
                              💬 "{user.comments[0].text}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Standard Detailed Cards */
                <div className="attendees-grid">
                  {filteredLikers.map((user) => {
                    const isFemale = user.genderInfo.gender === 'female';
                    const isHovered = hoveredUserId === user.pk;
                    
                    return (
                      <div 
                        key={user.pk} 
                        className={`glass-panel attendee-card ${isHovered ? 'hovered' : ''} ${isFemale ? 'glow-pink' : ''}`}
                        style={{ padding: '16px', background: 'rgba(10, 12, 24, 0.4)' }}
                        onMouseEnter={() => { setHoveredUserId(user.pk); setHoveredUsername(user.username); }}
                        onMouseLeave={() => { setHoveredUserId(null); setHoveredUsername(null); }}
                      >
                        {user.status !== 'none' && (
                          <div className={`attendee-status-indicator ${user.status}`}>
                            {user.status.replace('_', ' ')}
                          </div>
                        )}

                        <div className="attendee-profile-header">
                          <div className={`attendee-avatar-container ${isFemale ? 'female' : ''}`}>
                            <img 
                              src={getProxiedImageUrl(user.post_photo || user.profile_pic_url)} 
                              className="attendee-avatar" 
                              alt="" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              style={{ 
                                display: 'none', 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%', 
                                background: isFemale ? 'linear-gradient(135deg, var(--neon-pink), #cc0066)' : 'rgba(255,255,255,0.05)', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '18px', 
                                fontWeight: 'bold', 
                                color: 'white',
                                border: '2px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="attendee-names">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <a 
                                href={`https://instagram.com/${user.username}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="attendee-username"
                                style={{ margin: 0 }}
                              >
                                <span>@{user.username}</span>
                                <ExternalLink size={12} style={{ opacity: 0.5 }} />
                              </a>
                              <button 
                                className="btn-copy-username" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigator.clipboard.writeText(user.username);
                                  showBanner(`Copied @${user.username} to clipboard!`, "info");
                                }}
                                title="Copy username"
                                style={{ 
                                  background: 'none', 
                                  border: 'none', 
                                  padding: 0, 
                                  cursor: 'pointer', 
                                  color: 'var(--text-muted)', 
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                            <span className="attendee-fullname">{user.full_name || "Instagram User"}</span>
                            
                            <div className="badges-row">
                              {user.likedPostsCount > 1 && (
                                <span className="badge badge-confident" style={{ background: 'rgba(255, 0, 127, 0.15)', color: 'var(--neon-pink)', border: '1px solid var(--neon-pink)' }}>
                                  🔥 {user.likedPostsCount} Likes
                                </span>
                              )}
                              {user.is_private && <span className="badge badge-private">Private</span>}
                              {user.is_verified && <span className="badge badge-verified">Verified</span>}
                              {isFemale && <span className="badge badge-female">Female</span>}
                            </div>
                          </div>
                        </div>

                        <p className="attendee-bio">
                          {renderBioWithHighlights(user.bio, user.keywordHits)}
                        </p>

                        {user.comments && (
                          <div className="attendee-comments-list" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {user.comments.map((c, idx) => (
                              <div key={idx} style={{ 
                                background: 'rgba(255, 0, 127, 0.05)', 
                                borderLeft: '3.5px solid var(--neon-pink)', 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                fontSize: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <span style={{ color: 'rgba(255,255,255,0.95)', fontStyle: 'italic', fontWeight: '500' }}>
                                  "{c.text}"
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                  On post: <a href={c.post_url} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}>{c.post_code}</a>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {user.locationPosts && (
                          <div className="attendee-location-posts" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {user.locationPosts.map((p, idx) => (
                              <div key={idx} style={{ 
                                background: 'rgba(0, 240, 255, 0.05)', 
                                borderLeft: '3.5px solid var(--neon-cyan)', 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                fontSize: '12px',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center'
                              }}>
                                {p.post_photo && (
                                  <img 
                                    src={getProxiedImageUrl(p.post_photo)} 
                                    style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} 
                                    alt=""
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                  <span style={{ color: 'rgba(255,255,255,0.95)', fontStyle: 'italic' }}>
                                    "{p.caption || "No caption"}"
                                  </span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    📍 {p.location_name} • Post: <a href={`https://instagram.com/p/${p.code}`} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}>{p.code}</a>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {user.note && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: 'var(--neon-pink)', 
                            background: 'rgba(255,0,127,0.05)', 
                            padding: '6px 8px', 
                            borderRadius: '6px', 
                            borderLeft: '2px solid var(--neon-pink)',
                            marginBottom: '10px',
                            fontStyle: 'italic'
                          }}>
                            Note: {user.note}
                          </div>
                        )}

                        <div className="attendee-actions">
                          <div className="attendee-action-left">
                            <button 
                              className={`btn btn-secondary btn-icon-only btn-star ${user.isStarred ? 'starred' : ''}`}
                              onClick={() => handleToggleStar(user.pk)}
                            >
                              <Star size={16} />
                            </button>
                            
                            <button 
                              className="btn btn-secondary btn-icon-only btn-hide"
                              onClick={() => handleToggleHide(user.pk)}
                            >
                              <EyeOff size={16} />
                            </button>
                          </div>

                          <button 
                            className="btn btn-accent" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setSelectedLiker(user)}
                          >
                            Check Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut Visual Legend */}
      {hoveredUserId && (
        <div className="shortcut-legend-bar">
          <div className="shortcut-item">
            <span className="shortcut-key">S</span>
            <span>Star</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">H</span>
            <span>Hide/Dismiss</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">M</span>
            <span>Maybe Her</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">N</span>
            <span>Not Her</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">O</span>
            <span>Instagram</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">D</span>
            <span>Direct Msg</span>
          </div>
        </div>
      )}

      {/* Bulk Add Modal popup */}
      {showBulkAddModal && (
        <div className="modal-overlay" onClick={() => setShowBulkAddModal(false)}>
          <div className="modal-content bulk-add-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBulkAddModal(false)}>✕</button>
            <div className="modal-body">
              <h2 className="sidebar-title cyan"><Plus size={16} /> Bulk Import Suspect URLs</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Paste all 27 Instagram post/reel links below. Our regex parser will automatically filter out the post codes and append them to your suspect target list.
              </p>
              
              <div className="form-group">
                <textarea 
                  className="textarea-bulk" 
                  placeholder="Paste links here..."
                  value={bulkUrlsText}
                  onChange={(e) => setBulkUrlsText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowBulkAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleImportBulkUrls}>Parse & Import URLs</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal Popup */}
      {selectedLiker && (
        <div className="modal-overlay" onClick={() => setSelectedLiker(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedLiker(null)}>✕</button>
            
            <div className="modal-body">
              <div className="modal-profile-section">
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <img 
                    src={getProxiedImageUrl(selectedLiker.post_photo || selectedLiker.profile_pic_url)} 
                    className={`modal-avatar ${selectedLiker.genderInfo.gender === 'female' ? 'female' : ''}`} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{ 
                      display: 'none', 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      background: selectedLiker.genderInfo.gender === 'female' ? 'linear-gradient(135deg, var(--neon-pink), #cc0066)' : 'rgba(255,255,255,0.05)', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: 'white',
                      border: '3px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {selectedLiker.username.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="modal-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a 
                      href={`https://instagram.com/${selectedLiker.username}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="modal-username"
                      style={{ margin: 0 }}
                    >
                      <span>@{selectedLiker.username}</span>
                      <ExternalLink size={16} />
                    </a>
                    <button 
                      className="btn-copy-username" 
                      onClick={() => { 
                        navigator.clipboard.writeText(selectedLiker.username);
                        showBanner(`Copied @${selectedLiker.username} to clipboard!`, "info");
                      }}
                      title="Copy username"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        cursor: 'pointer', 
                        color: 'var(--text-muted)', 
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <span className="modal-fullname">{selectedLiker.full_name || "Instagram User"}</span>
                  
                  <div className="badges-row" style={{ marginTop: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedLiker.is_private && <span className="badge badge-private" style={{ padding: '4px 8px', fontSize: '11px' }}>Private</span>}
                    {selectedLiker.is_verified && <span className="badge badge-verified" style={{ padding: '4px 8px', fontSize: '11px' }}>Verified</span>}
                    {selectedLiker.genderInfo.gender === 'female' && (
                      <span className="badge badge-female" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        Female
                      </span>
                    )}
                    <button 
                      className="badge badge-confident" 
                      onClick={() => handleFetchHDPhoto(selectedLiker)}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '11px', 
                        background: 'rgba(0, 240, 255, 0.1)', 
                        color: 'var(--neon-cyan)', 
                        border: '1px solid var(--neon-cyan)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      disabled={hdLoadingIds.includes(selectedLiker.pk)}
                    >
                      {hdLoadingIds.includes(selectedLiker.pk) ? "⏳ Loading..." : "📸 Load HD Photo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Biography Section */}
              <div className="modal-bio-section">
                <div className="modal-section-title">Biography / Profile Intro</div>
                <div className="modal-bio-content">
                  {renderBioWithHighlights(selectedLiker.bio, selectedLiker.keywordHits)}
                </div>
              </div>

              {/* Comments Section */}
              {selectedLiker.comments && selectedLiker.comments.length > 0 && (
                <div className="modal-bio-section" style={{ marginTop: '16px' }}>
                  <div className="modal-section-title" style={{ color: 'var(--neon-pink)' }}>💬 Festival Comments ({selectedLiker.comments.length})</div>
                  <div className="modal-bio-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255, 0, 127, 0.03)', borderColor: 'rgba(255, 0, 127, 0.1)' }}>
                    {selectedLiker.comments.map((c, idx) => (
                      <div key={idx} style={{ paddingBottom: idx < selectedLiker.comments.length - 1 ? '8px' : 0, borderBottom: idx < selectedLiker.comments.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.95)' }}>
                          "{c.text}"
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          On post: <a href={c.post_url} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}>{c.post_code}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Posts Section */}
              {selectedLiker.locationPosts && selectedLiker.locationPosts.length > 0 && (
                <div className="modal-bio-section" style={{ marginTop: '16px' }}>
                  <div className="modal-section-title" style={{ color: 'var(--neon-cyan)' }}>📍 Grandvalira Festival Posts ({selectedLiker.locationPosts.length})</div>
                  <div className="modal-bio-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 240, 255, 0.03)', borderColor: 'rgba(0, 240, 255, 0.1)' }}>
                    {selectedLiker.locationPosts.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', paddingBottom: idx < selectedLiker.locationPosts.length - 1 ? '10px' : 0, borderBottom: idx < selectedLiker.locationPosts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                        {p.post_photo && (
                          <img 
                            src={getProxiedImageUrl(p.post_photo)} 
                            style={{ width: '70px', height: '70px', borderRadius: '6px', objectFit: 'cover' }} 
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.95)' }}>
                            "{p.caption || "No caption"}"
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            📍 {p.location_name} • Posted: {new Date(p.taken_at).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '11px' }}>
                            <a href={`https://instagram.com/p/${p.code}`} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}>
                              View Post on Instagram ({p.like_count} likes, {p.comment_count} comments)
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liked Suspect Posts Section */}
              <div className="modal-bio-section" style={{ marginTop: '16px' }}>
                <div className="modal-section-title">Liked Suspect Posts ({selectedLiker.likedPostsCount || 1})</div>
                <div className="modal-bio-content" style={{ fontSize: '13px', background: 'rgba(0, 240, 255, 0.03)', borderColor: 'rgba(0, 240, 255, 0.1)' }}>
                  {selectedLiker.likedPostIds ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                      {selectedLiker.likedPostIds.map(pid => {
                        const target = targets.find(t => t.id === pid);
                        return (
                          <li key={pid}>
                            <strong>Post {pid.substring(0,8)}:</strong> {target?.caption || "Suspect Post"} 
                            {target?.url && (
                              <a href={target.url} target="_blank" rel="noreferrer" style={{ marginLeft: '6px', color: 'var(--neon-cyan)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                View <ExternalLink size={10} />
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span>Liked active target post</span>
                  )}
                </div>
              </div>

              {/* Status Flag dropdown */}
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Review Status Tag</label>
                <select 
                  className="form-input"
                  value={selectedLiker.status}
                  onChange={(e) => handleStatusChange(selectedLiker.pk, e.target.value)}
                >
                  <option value="none">No label set (Default)</option>
                  <option value="maybe">🤔 Maybe Her (Inspect Closely)</option>
                  <option value="contact">📞 Must Contact (Exchanged Look/Match)</option>
                  <option value="not_her">❌ Checked (Not Her)</option>
                </select>
              </div>

              {/* Notes Input Area */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Personal Inspection Notes</label>
                <textarea 
                  className="modal-notes-area"
                  placeholder="Add details about why this profile could be a match (e.g. 'She wears a neon green ski helmet...')"
                  value={selectedLiker.note}
                  onChange={(e) => handleNotesChange(selectedLiker.pk, e.target.value)}
                />
              </div>

              {/* Links Action Row */}
              <div className="modal-direct-links">
                <a 
                  href={`https://instagram.com/${selectedLiker.username}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <InstagramIcon size={16} />
                  <span>View Instagram</span>
                </a>
                
                <a 
                  href={`https://instagram.com/direct/t/${selectedLiker.username}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-pink"
                  style={{ textDecoration: 'none' }}
                >
                  <MessageSquare size={16} />
                  <span>Send Direct Message</span>
                </a>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => { handleCopyClipboard(`https://instagram.com/${selectedLiker.username}`); }}
                >
                  <Copy size={12} />
                  <span>Copy Profile URL</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => { handleToggleHide(selectedLiker.pk); setSelectedLiker(null); }}
                >
                  <EyeOff size={12} />
                  <span>Hide User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Snowgirl Finder © 2026. Made with ❤️ to help you locate your missed encounter at Snowrow Andorra.</p>
        <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          This is an independent tool utilizing public scraping APIs. Please use responsibly and respect user privacy.
        </p>
      </footer>
    </>
  );
}

export default App;

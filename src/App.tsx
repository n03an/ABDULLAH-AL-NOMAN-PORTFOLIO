import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Leaf, 
  MapPin, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Award, 
  FileText, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Plus, 
  Linkedin, 
  Github, 
  ArrowUp, 
  Menu, 
  X, 
  ExternalLink,
  Code2,
  Compass,
  FileCode,
  User,
  Hash,
  Database,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Search,
  BookMarked,
  Layers,
  Activity,
  Video,
  Play,
  Camera,
  Heart,
  Plane,
  Globe,
  Facebook,
  Instagram,
  Phone,
  Cloud,
  LogOut,
  Loader2,
  Check,
  AlertTriangle,
  FileVideo
} from "lucide-react";
import { 
  initAuth, 
  googleSignIn, 
  logoutFromGoogle, 
  fetchDriveVideos, 
  DriveVideoFile 
} from "./lib/googleDrive";
import { User as FirebaseUser } from "firebase/auth";

// Academic & Brand icons represented beautifully using pure Tailwind and custom styles
export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("education"); // education vs interests vs activities (Biographical tabs)

  // Profile Picture State & Handlers
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    try {
      return localStorage.getItem("noman_profile_pic") || null;
    } catch {
      return null;
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Please select an image smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        try {
          localStorage.setItem("noman_profile_pic", base64String);
        } catch (err) {
          console.warn("Storage quota exceeded, storing in state only.", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Video Resume state & stateful editing
  const [videoUrl, setVideoUrl] = useState(() => {
    try {
      return localStorage.getItem("noman_video_resume_url") || "https://www.youtube.com/embed/Q0A6B-K6t20";
    } catch {
      return "https://www.youtube.com/embed/Q0A6B-K6t20";
    }
  });
  const [tempVideoUrl, setTempVideoUrl] = useState(videoUrl);
  const [isEditingVideo, setIsEditingVideo] = useState(false);

  // Google Drive Integration state
  const [driveUser, setDriveUser] = useState<FirebaseUser | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveVideos, setDriveVideos] = useState<DriveVideoFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSearchQuery, setDriveSearchQuery] = useState("");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [videoConfigMode, setVideoConfigMode] = useState<"drive" | "youtube">("drive");

  // Initialize Google Drive Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
        setIsAuthChecking(false);
        if (token) {
          handleFetchDriveVideos(token, driveSearchQuery);
        }
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
        setDriveVideos([]);
        setIsAuthChecking(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleFetchDriveVideos = async (token: string, search: string = "") => {
    setDriveLoading(true);
    setDriveError(null);
    try {
      const files = await fetchDriveVideos(token, search);
      setDriveVideos(files);
    } catch (err: any) {
      setDriveError(err?.message || "Failed to load files from Google Drive.");
    } finally {
      setDriveLoading(false);
    }
  };

  const handleGoogleDriveSignIn = async () => {
    setDriveError(null);
    setDriveLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveToken(result.accessToken);
        await handleFetchDriveVideos(result.accessToken, driveSearchQuery);
      }
    } catch (err: any) {
      setDriveError(err?.message || "Failed to authenticate with Google.");
    } finally {
      setDriveLoading(false);
    }
  };

  const handleGoogleDriveSignOut = async () => {
    setDriveError(null);
    try {
      await logoutFromGoogle();
      setDriveUser(null);
      setDriveToken(null);
      setDriveVideos([]);
    } catch (err: any) {
      setDriveError(err?.message || "Failed to sign out.");
    }
  };

  const handleSearchDriveVideos = (e: React.FormEvent) => {
    e.preventDefault();
    if (driveToken) {
      handleFetchDriveVideos(driveToken, driveSearchQuery);
    }
  };

  // Traveling Spots & Photography State
  const [travelSpots, setTravelSpots] = useState(() => {
    try {
      const saved = localStorage.getItem("noman_travel_spots");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read travel spots from local storage", e);
    }
    return [
      {
        id: 1,
        title: "Sreemangal Rain Forests & Swamps",
        location: "Maulvibazar, Sylhet",
        description: "Documented wild stream cyprinid populations in hilly creeks flowing through rain forests.",
        image: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600",
        camera: "Fujifilm X-T4",
        settings: "23mm • f/4.0 • ISO 320",
        date: "October 2025"
      },
      {
        id: 2,
        title: "Sunset Over Padma River Bed",
        location: "Rajshahi Division",
        description: "Capturing local gillnet fishing vessels moving against heavy monsoon seasonal currents.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
        camera: "Sony Alpha 7R III",
        settings: "70mm • f/2.8 • ISO 100",
        date: "August 2025"
      },
      {
        id: 3,
        title: "Chalan Beel Deep Wetlands",
        location: "Natore-Pabna, Bangladesh",
        description: "An intensive photography series tracking native species as floodplain levels drop.",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
        camera: "Fujifilm X-T4",
        settings: "16mm • f/8.0 • ISO 200",
        date: "November 2025"
      },
      {
        id: 4,
        title: "Saint Martin's Marine Reef",
        location: "Bay of Bengal",
        description: "Explored coastal coral ecosystems and took crystal-clear photographs of marine fish microhabitats.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
        camera: "Sony Alpha 7R III",
        settings: "35mm • f/1.8 • ISO 400",
        date: "January 2026"
      }
    ];
  });

  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  // Home Page activities list with persistent Storage support
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem("noman_activities");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read activities", e);
    }
    return [
      {
        id: 1,
        date: "June 12, 2026",
        tag: "Research Analysis",
        tagColor: "bg-emerald-50 text-[#2A5C4A] border-emerald-200",
        title: "Chalan Beel R Modeling Run",
        description: "Successfully processed Community Ordination models (NMDS) on 42-species cyprinid field data, achieving a stress factor of 0.11 indicating highly reliable ecological cluster structures."
      },
      {
        id: 2,
        date: "May 28, 2026",
        tag: "Field Samplings",
        tagColor: "bg-blue-50 text-blue-700 border-blue-200",
        title: "Completed Padma River Basin Pre-Monsoon sampling",
        description: "Conducted 12-hour spatial sampling at three distinct channel beds to survey wild cyprinid breeding habitats and water parameter values."
      },
      {
        id: 3,
        date: "April 15, 2026",
        tag: "Publications & Writing",
        tagColor: "bg-purple-50 text-purple-700 border-purple-200",
        title: "Drafted manuscript with Dr. S. M. Galib",
        description: "Completed first draft detailing the ecological habitat preferences of critically endangered fish species in floodplains for submission to a peer-reviewed conservation journal."
      },
      {
        id: 4,
        date: "March 05, 2026",
        tag: "Academic Ranks",
        tagColor: "bg-amber-50 text-amber-700 border-amber-200",
        title: "Achieved Departmental 1st Rank with CGPA 3.92",
        description: "Honored with academic distinction for topping the Department of Fisheries class curriculum at the University of Rajshahi."
      }
    ];
  });

  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    tag: "Research Analysis"
  });
  const [showAddActivity, setShowAddActivity] = useState(false);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.description) {
      alert("Please fill in both the Title and Description.");
      return;
    }
    
    let tagColor = "bg-emerald-50 text-[#2A5C4A] border-emerald-200";
    if (newActivity.tag === "Field Samplings") tagColor = "bg-blue-50 text-blue-700 border-blue-200";
    if (newActivity.tag === "Publications & Writing") tagColor = "bg-purple-50 text-purple-705 border-purple-200";
    if (newActivity.tag === "Academic Ranks") tagColor = "bg-amber-50 text-amber-708 border-amber-200";

    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const updated = [
      {
        id: Date.now(),
        date: formattedDate,
        tag: newActivity.tag,
        tagColor,
        title: newActivity.title,
        description: newActivity.description
      },
      ...activities
    ];

    setActivities(updated);
    try {
      localStorage.setItem("noman_activities", JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }

    setNewActivity({ title: "", description: "", tag: "Research Analysis" });
    setShowAddActivity(false);
  };

  const [newSpot, setNewSpot] = useState({
    title: "",
    location: "",
    description: "",
    image: "",
    camera: "Fujifilm X-T4",
    settings: "",
    date: ""
  });
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);

  const handleAddSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpot.title || !newSpot.location || !newSpot.image) {
      alert("Please fill in Title, Location and Image link.");
      return;
    }
    const updated = [
      ...travelSpots,
      {
        ...newSpot,
        id: Date.now(),
        settings: newSpot.settings || "24mm • f/4.0 • ISO 100",
        date: newSpot.date || "June 2026"
      }
    ];
    setTravelSpots(updated);
    try {
      localStorage.setItem("noman_travel_spots", JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setNewSpot({
      title: "",
      location: "",
      description: "",
      image: "",
      camera: "Fujifilm X-T4",
      settings: "",
      date: ""
    });
    setShowAddSpotModal(false);
  };
  
  // Contact Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "PhD Inquiry / Research Collaboration",
    message: ""
  });

  // Calendly State
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Email of candidate
  const emailAddress = "noman102470@gmail.com";

  // Section Refs for Scroll Intersection Spying
  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    video: useRef<HTMLElement>(null),
    interests: useRef<HTMLElement>(null),
    research: useRef<HTMLElement>(null),
    skills: useRef<HTMLElement>(null),
    publications: useRef<HTMLElement>(null),
    gallery: useRef<HTMLElement>(null),
    hobbies: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const handleScroll = () => {
      // Toggle back-to-top button
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const scrollToSection = (sectionId: keyof typeof sectionRefs) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    // Simulate API request
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "PhD Inquiry / Research Collaboration",
        message: ""
      });
      alert("Message mock-sent successfully!");
    }, 2000);
  };

  const handleMockSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      setScheduleSuccess(true);
      setTimeout(() => {
        setScheduleSuccess(false);
        setShowScheduler(false);
        setSelectedDate(null);
        setSelectedTime(null);
      }, 4000);
    }
  };

  // Mock days of week for Calendly
  const availableDates = [
    { date: "June 22, 2026", day: "Mon" },
    { date: "June 23, 2026", day: "Tue" },
    { date: "June 24, 2026", day: "Wed" },
    { date: "June 25, 2026", day: "Thu" },
    { date: "June 26, 2026", day: "Fri" },
  ];

  const availableTimes = ["09:00 AM EST", "11:00 AM EST", "02:00 PM EST", "04:30 PM EST"];

  // Research Gallery items (to mirror the Fieldwork/Gallery pages found in Galib's templates)
  const galleryItems = [
    {
      id: 1,
      title: "Field Sampling in Padma River Basin",
      category: "field",
      description: "Collecting cyprinid specimens during dry seasons to measure localized richness variances.",
      image: "https://images.unsplash.com/photo-1505903658795-8d3cc48039e4?w=600"
    },
    {
      id: 2,
      title: "Chalan Beel Wetland Hydrology Survey",
      category: "field",
      description: "Deploying multiparameter water sondes to profile water salinity, turbidity and DO.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"
    },
    {
      id: 3,
      title: "Taxonomic Laboratory Identifications",
      category: "lab",
      description: "Examining minute bio-indicators under dissecting scope for fish gut analysis experiments.",
      image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=600"
    },
    {
      id: 4,
      title: "R Shiny Dashboard and Quantitative Modeling",
      category: "code",
      description: "Running non-metric multidimensional scaling (NMDS) to classify wetland microhabitat usage.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600"
    }
  ];

  const filteredGallery = galleryFilter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === galleryFilter);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8F9FA] text-[#2D3E40] relative overflow-x-hidden contour-pattern">
      
      {/* BACKGROUND DECORATIVE SEED LOBES - AQUATIC RIPPLING WAVES */}
      <div className="absolute top-[8%] right-[-120px] w-[350px] h-[350px] opacity-[0.03] pointer-events-none text-[#2A5C4A]">
        <svg viewBox="0 0 100 100" stroke="currentColor" fill="none" strokeWidth="1" className="w-full h-full animate-pulse">
          <circle cx="50" cy="50" r="10" />
          <circle cx="50" cy="50" r="25" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="55" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] opacity-[0.03] pointer-events-none text-[#2A5C4A]">
        <svg viewBox="0 0 100 100" stroke="currentColor" fill="none" strokeWidth="1" className="w-full h-full">
          <circle cx="50" cy="50" r="15" />
          <circle cx="50" cy="50" r="30" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="45" />
        </svg>
      </div>

      {/* STICKY HEADER WITH OPACITY GRADIENT ON SCROLL */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Name on the Left with User Profile Photo replacing Leaf Icon */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => scrollToSection("hero")}>
            <div className="w-10 h-10 rounded-full border border-emerald-100 overflow-hidden bg-[#2A5C4A] flex items-center justify-center shadow-md transition-all group-hover:scale-105 shrink-0">
              {profilePic ? (
                <img src={profilePic} alt="Abdullah Al Noman" className="rounded-full w-full h-full object-cover" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e7aa?w=300" 
                  alt="Abdullah Al Noman" 
                  className="rounded-full w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              <span className="font-heading font-bold text-base sm:text-lg leading-none tracking-tight text-[#2A5C4A] whitespace-nowrap">
                ABDULLAH AL NOMAN
              </span>
              <span className="text-[#2A5C4A]/30 text-xs sm:text-sm font-light">|</span>
              <span className="text-stone-500 font-mono text-[9px] sm:text-10px tracking-widest uppercase whitespace-nowrap pt-0.5">
                RESEARCHER
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links - Mirroring the menu structures of thegalib's site */}
          <nav className="hidden md:flex space-x-1 lg:space-x-1.5 xl:space-x-2">
            {[
              { id: "hero", label: "Home" },
              { id: "about", label: "About" },
              { id: "video", label: "Video Resume" },
              { id: "interests", label: "Research Domains" },
              { id: "research", label: "PROJECTS" },
              { id: "skills", label: "Skills" },
              { id: "publications", label: "Publications" },
              { id: "gallery", label: "Field Gallery" },
              { id: "hobbies", label: "My Hobbies" },
              { id: "contact", label: "Contact" }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id as keyof typeof sectionRefs)}
                className={`px-3 py-2 rounded-lg font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeSection === link.id
                    ? "text-[#2A5C4A] bg-emerald-50/70 border-b-2 border-[#2A5C4A]"
                    : "text-[#2D3E40] hover:text-[#3A7CA5] hover:bg-slate-50"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Connected Search Tool, Action button, and Profile Picture Corner Widget */}
          <div className="flex items-center space-x-3">
            {/* Connected Search Tool / PhD Application Alert Pill */}
            <div className="hidden lg:block">
              <button
                onClick={() => scrollToSection("contact")}
                className="px-4 py-2.5 bg-[#2A5C4A] text-white rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-[#1e4235] cursor-pointer transition-all hover:shadow-md flex items-center space-x-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Seeking Advisor</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePicChange} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#2A5C4A] hover:bg-slate-100 cursor-pointer transition-colors focus:ring-2 focus:ring-emerald-200"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-100 bg-white shadow-xl absolute top-20 left-0 w-full z-40"
            >
              <div className="px-4 py-5 space-y-2">
                {[
                  { id: "hero", label: "Home" },
                  { id: "about", label: "About & Biography" },
                  { id: "video", label: "Video Resume" },
                  { id: "interests", label: "Research Domains" },
                  { id: "research", label: "PROJECTS" },
                  { id: "skills", label: "Technical Skills" },
                  { id: "publications", label: "Publications & Talks" },
                  { id: "gallery", label: "Field Gallery" },
                  { id: "hobbies", label: "Travelling & Photography" },
                  { id: "contact", label: "Contact & Scheduling" }
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id as keyof typeof sectionRefs)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-heading text-sm font-semibold uppercase tracking-wider transition-all ${
                      activeSection === link.id
                        ? "text-[#2A5C4A] bg-emerald-50/60 font-bold"
                        : "text-[#2D3E40] hover:text-[#3A7CA5] hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="w-full py-3 bg-[#2A5C4A] text-white text-center rounded-lg font-heading text-xs font-semibold tracking-wide uppercase hover:bg-emerald-800 transition-colors"
                  >
                    PhD Advisorship Inquiry
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN SITE LAYOUT */}
      <main className="flex-grow">
        
        {/* SECTION 1: HERO */}
        {activeSection === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.hero} 
              id="hero" 
              className="relative min-h-[85vh] flex items-center py-12 md:py-20 bg-gradient-to-b from-white via-emerald-50/15 to-white"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Right academic video resume frame with Soft Shadows & Captions (Swapped to Right) */}
              <div className="lg:col-span-5 relative lg:order-last">
                <div className="relative mx-auto max-w-[380px] sm:max-w-[420px] lg:max-w-none">
                  {/* Decorative background geometry */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800/10 to-blue-850/10 rounded-2xl transform rotate-3 translate-x-4 translate-y-4 -z-10 transition-transform"></div>
                  
                  {/* Video Resume Frame */}
                  <div 
                    className="rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-stone-950 relative aspect-video w-full group/herovideo"
                  >
                    <iframe
                      src={videoUrl.includes("drive.google.com") ? videoUrl : `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&playlist=${(() => {
                        try {
                          if (videoUrl.includes("embed/")) return videoUrl.split("embed/")[1]?.split("?")[0]?.split("&")[0];
                          if (videoUrl.includes("v=")) return videoUrl.split("v=")[1]?.split("?")[0]?.split("&")[0];
                          if (videoUrl.includes("youtu.be/")) return videoUrl.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
                        } catch {}
                        return "Q0A6B-K6t20";
                      })()}&playsinline=1&controls=1&rel=0`}
                      title="Abdullah Al Noman Video Resume"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    
                    {/* Caption overlay in the video */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pb-3 text-white pointer-events-none z-10">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">Interactive Resume</p>
                      <p className="font-heading font-semibold text-xs">Abdullah Al Noman — Video Resume & Pitch</p>
                    </div>

                    {/* Quick indicator badge */}
                    <div className="absolute top-3 right-3 bg-[#2A5C4A] text-white font-mono text-[9px] font-bold tracking-wider px-2 py-1 rounded-md shadow-md uppercase z-20 flex items-center space-x-1 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      <span>Auto Playing</span>
                    </div>
                  </div>


                </div>
              </div>

              {/* Left text column (Swapped to Left) */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:order-first">
                
                {/* Micro announcement pill */}
                <div className="inline-flex items-center space-x-2 bg-emerald-50 text-[#2A5C4A] px-3.5 py-1.5 rounded-full border border-emerald-100/50 w-fit">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span className="font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider">
                    Actively Seeking PhD Positions (Fall 2027 / Spring 2028)
                  </span>
                </div>

                <div className="space-y-3">
                   <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#2A5C4A] tracking-tight leading-none">
                     ABDULLAH AL NOMAN
                   </h1>
                   <p className="font-heading font-medium text-lg sm:text-xl text-stone-500 max-w-2xl leading-snug">
                     Ecologist in Training <span className="text-[#3A7CA5]">|</span> Undergraduate Researcher <span className="text-[#3A7CA5]">|</span> Seeking PhD Advisor in Aquatic Ecology
                   </p>
                </div>

                {/* Specific Ecological Research Statement */}
                <p className="text-lg md:text-xl text-[#2D3E40] leading-relaxed max-w-2xl border-l-4 border-[#2A5C4A] pl-4 italic">
                  "I study <strong className="text-[#2A5C4A] font-semibold">community ecology of freshwater fish in tropical floodplain wetlands</strong> to understand how physical stressors and hydrological seasonal pulses mediate biological diversity, with the target of informing evidence-based conservation."
                </p>

                {/* Primary Affiliations & Target Area Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center space-x-3 text-stone-600">
                    <GraduationCap className="w-5 h-5 text-[#3A7CA5] shrink-0" />
                    <span className="text-sm font-medium">Department of Fisheries, <strong className="text-zinc-800">University of Rajshahi, Bangladesh</strong></span>
                  </div>
                  <div className="flex items-center space-x-3 text-stone-600">
                    <Compass className="w-5 h-5 text-[#3A7CA5] shrink-0" />
                    <span className="text-sm font-medium">Target Regions: <strong className="text-zinc-800 font-semibold">North America, Europe, Australia</strong></span>
                  </div>
                </div>

                {/* Call to Actions (Smooth scrolling) */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => scrollToSection("research")}
                    className="px-6 py-3.5 bg-[#2A5C4A] hover:bg-[#1e4235] text-white font-heading font-semibold rounded-xl text-center shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm uppercase tracking-wide"
                  >
                    <span>View Selected Research</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-350 font-heading font-semibold rounded-xl text-center transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm uppercase tracking-wide"
                  >
                    <Mail className="w-4 h-4 mr-1 text-[#3A7CA5]" />
                    <span>Contact & Schedule</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Live updates / activities feed row below the main hero information */}
            <div className="mt-20 pt-16 border-t border-slate-150">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-3 w-3 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#2A5C4A]">
                    Recent Activities & Live Updates
                  </h2>
                </div>

                <button
                  onClick={() => setShowAddActivity(!showAddActivity)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-250 text-[#2A5C4A] rounded-xl font-heading text-xs font-bold uppercase tracking-wide transition-all self-start md:self-center cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Live Update</span>
                </button>
              </div>

              {/* Activity Add form overlay card */}
              <AnimatePresence>
                {showAddActivity && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8 p-6 bg-[#EBF6F0]/40 border border-emerald-200 rounded-2xl overflow-hidden shadow-xs"
                  >
                    <form onSubmit={handleAddActivity} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#2A5C4A] uppercase tracking-wider">Publish New Activity Milestone</h3>
                        <button 
                          type="button" 
                          onClick={() => setShowAddActivity(false)}
                          className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Activity Title</label>
                          <input
                            type="text"
                            value={newActivity.title}
                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                            className="w-full text-xs font-medium p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-[#2A5C4A]"
                            placeholder="e.g. Conducted Wetland Sampling Trip"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Tag Group</label>
                          <select
                            value={newActivity.tag}
                            onChange={(e) => setNewActivity({ ...newActivity, tag: e.target.value })}
                            className="w-full text-xs font-medium p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-[#2A5C4A]"
                          >
                            <option value="Research Analysis">Research Analysis</option>
                            <option value="Field Samplings">Field Samplings</option>
                            <option value="Publications & Writing">Publications & Writing</option>
                            <option value="Academic Ranks">Academic Ranks</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Milestone Description</label>
                        <textarea
                          value={newActivity.description}
                          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                          className="w-full text-xs font-medium p-2.5 bg-white border border-slate-200 rounded-lg h-16 resize-none focus:outline-[#2A5C4A]"
                          placeholder="e.g. Gathered sediment cores and analyzed salinity values..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2A5C4A] hover:bg-[#1a3a2f] text-white rounded-lg font-heading text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Publish Update
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Real Activity List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((item: any) => (
                  <div 
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-[#2A5C4A] hover:shadow-md transition-all duration-350 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] uppercase font-bold border ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 font-bold">
                          {item.date}
                        </span>
                      </div>

                      <h3 className="font-heading font-semibold text-sm text-[#2A5C4A] hover:text-[#3A7CA5] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-[11.5px] leading-relaxed text-stone-500 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 2: ABOUT / MY PATH */}
        {activeSection === "about" && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.about} 
              id="about" 
              className="py-20 md:py-24 bg-white border-t border-b border-slate-150 relative"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              {/* Left Column for sticky section header */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                    <User className="w-4 h-4 text-[#2A5C4A]" />
                    <span>01. Trajectory & Profile</span>
                  </div>
                  <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A] leading-tight mt-2">
                    About Me
                  </h2>
                  <div className="h-1 bg-[#3A7CA5] w-20 rounded-full mt-3"></div>
                </div>

                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  Bridging field observational fish biology with quantitative R modeling. Researching floodplains, exotics adaptation and conservation solutions alongside Dr. S. M. Galib at the University of Rajshahi.
                </p>

                {/* Professional CV Download Trigger Card */}
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5 shadow-sm">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-5 h-5 text-[#2A5C4A]" />
                    <span className="font-heading font-semibold text-xs uppercase tracking-wider text-stone-700">Full Curriculum Vitae</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Review completed field hours, analytical techniques, lists of seminars, and transcripts.
                  </p>
                  <a 
                    href="https://drive.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:border-[#3A7CA5] text-stone-700 hover:text-[#3A7CA5] rounded-lg font-heading text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs"
                  >
                    <span>View CV on Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </div>
              </div>

              {/* Right Column for Narrative timeline tabs */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 150-200 Word Narrative with absolute mandatory words */}
                <div className="text-lg text-[#2D3E40] leading-relaxed space-y-6">
                  <p>
                    My core scientific fascination centers on how tropical river-floodplain networks adapt to seasonal flow changes and human hydrological alterations. Because wetlands play a fundamental role in global fish productivity and critical water cycle regulation, understanding community-level dynamics is vital to develop effective ecological safeguards.
                  </p>
                  <p>
                    Throughout my undergraduate research program at the <strong className="text-[#2A5C4A]">Department of Fisheries, University of Rajshahi</strong>, I have conducted extensive field collections of cyprinids and siluriforms across multiple degraded channels, learning to measure complex physical gradients while developing highly repeatable species abundance datasets. This rigorous training has allowed me to master the deployment of advanced multivariate statistical techniques and community ordination tools.
                  </p>
                  <p>
                    My career target is to pursue an intensive PhD program in either <strong className="text-[#2A5C4A]">North America or Europe</strong>, where I aim to explore how climatic extremes alter fish habitat connectivity. Beyond individual academic milestones, I am immensely open to new collaborations, cross-disciplinary ecosystems inquiries, and international field initiatives to support sustainable fisheries worldwide.
                  </p>
                </div>

                {/* Quote Block - Beautiful off-green banner */}
                <div className="p-6 sm:p-8 bg-[#EBF6F0]/80 rounded-2xl border-l-4 border-[#2A5C4A] relative overflow-hidden shadow-xs">
                  <span className="absolute top-0 right-1 font-serif text-[#2A5C4A]/10 text-9xl leading-none">“</span>
                  <p className="text-[#2A5C4A] font-heading font-medium text-lg italic leading-relaxed relative z-10">
                    "I believe ecology must bridge field observations with quantitative analysis. Collecting rigorous primary specimens is as critical as writing reproducible analytical code to trace species nestedness."
                  </p>
                  <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest mt-4 block">
                    — Abdullah Al Noman, Research Philosophy
                  </p>
                </div>

                {/* Biographical Tabs Panel (Mirroring education history in Galib's CV setup) */}
                <div className="space-y-4">
                  <div className="flex border-b border-slate-200">
                    {[
                      { id: "education", label: "Education & Qualifications" },
                      { id: "mentorship", label: "Teaching & Lab Mentorship" },
                      { id: "contributions", label: "Scholarly Memberships" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-4 font-heading text-xs uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? "border-[#2A5C4A] text-[#2A5C4A]"
                            : "border-transparent text-stone-500 hover:text-stone-700 hover:border-slate-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 min-h-[160px]">
                    <AnimatePresence mode="wait">
                      {activeTab === "education" && (
                        <motion.div
                          key="education"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="space-y-4 text-sm"
                        >
                          <div className="relative pl-6 border-l-2 border-emerald-100">
                            <div className="absolute h-3 w-3 bg-[#2A5C4A] rounded-full -left-[7px] top-1"></div>
                            <span className="text-xs font-mono font-bold text-[#3A7CA5]">2022 – Present</span>
                            <h4 className="font-heading font-semibold text-[#2A5C4A] mt-0.5">B.Sc. (Hons.) in Fisheries</h4>
                            <p className="text-stone-600 font-medium text-xs mt-0.5">Department of Fisheries, University of Rajshahi, Bangladesh</p>
                            <p className="text-xs text-stone-500 mt-1 leading-snug">CGPA: <strong>3.92 / 4.00</strong> (Class Rank: 1st out of 55). Top scholastic scorer in Ichthyology, Limnology, Biostatistics, and Aquatic Resource Management.</p>
                          </div>
                          
                          <div className="relative pl-6 border-l-2 border-emerald-100">
                            <div className="absolute h-3 w-3 bg-emerald-300 rounded-full -left-[7px] top-1"></div>
                            <span className="text-xs font-mono font-bold text-[#3A7CA5]">2019 – 2021</span>
                            <h4 className="font-heading font-semibold text-stone-700 mt-0.5">Higher Secondary Certificate (HSC) in Science</h4>
                            <p className="text-stone-600 font-medium text-xs mt-0.5">Rajshahi College, Bangladesh</p>
                            <p className="text-xs text-stone-500 mt-1">GPA: <strong>5.00 / 5.00</strong>. Specialized in Biology, Chemistry, and Mathematics.</p>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "mentorship" && (
                        <motion.div
                          key="mentorship"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="space-y-4 text-sm"
                        >
                          <div className="relative pl-6 border-l-2 border-emerald-100">
                            <div className="absolute h-3 w-3 bg-[#2A5C4A] rounded-full -left-[7px] top-1"></div>
                            <span className="text-xs font-mono font-bold text-[#3A7CA5]">2024 – 25 Term</span>
                            <h4 className="font-heading font-semibold text-[#2A5C4A] mt-0.5">Undergraduate Lab Coordinator</h4>
                            <p className="text-stone-600 font-medium text-xs mt-0.5">Wetland Ecology & Fish Biology Lab, University of Rajshahi</p>
                            <p className="text-xs text-stone-500 mt-1 leading-snug">Helped coordinate field sampling trips for 30+ sophomore students, managed water testing probes, organized the laboratory fish species museum collection and morphological curation.</p>
                          </div>
                          
                          <div className="relative pl-6 border-l-2 border-emerald-100">
                            <div className="absolute h-3 w-3 bg-emerald-300 rounded-full -left-[7px] top-1"></div>
                            <span className="text-xs font-mono font-bold text-[#3A7CA5]">2024</span>
                            <h4 className="font-heading font-semibold text-stone-700 mt-0.5">Student Facilitator</h4>
                            <p className="text-stone-600 font-medium text-xs mt-0.5">Introduction to Ecological Programming (R Workshop Series)</p>
                            <p className="text-xs text-stone-500 mt-1">Guided fellow undergraduates through basic package syntaxes such as `ggplot2`, custom functions, `dplyr`, and data hygiene pipelines.</p>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "contributions" && (
                        <motion.div
                          key="contributions"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="space-y-4 text-sm"
                        >
                          <div className="relative pl-6 border-l-2 border-emerald-100">
                            <div className="absolute h-3 w-3 bg-[#2A5C4A] rounded-full -left-[7px] top-1"></div>
                            <span className="text-xs font-mono font-bold text-[#3A7CA5]">2023 – Present</span>
                            <h4 className="font-heading font-semibold text-[#2A5C4A] mt-0.5">Volunteer Contributor</h4>
                            <p className="text-stone-600 font-medium text-xs mt-0.5">Bangladesh Fisheries Information Share (BdFish - bdfish.org)</p>
                            <p className="text-xs text-stone-500 mt-1 leading-snug">Drafted, formatted and proofread 6 community-targeted species profile articles, explaining spatial ranges and physical vulnerabilities of endangered freshwater fauna.</p>
                          </div>
                          
                          <div className="relative pl-6 border-l-2 border-emerald-100">
                            <div className="absolute h-3 w-3 bg-emerald-300 rounded-full -left-[7px] top-1"></div>
                            <span className="text-xs font-mono font-bold text-[#3A7CA5]">2025</span>
                            <h4 className="font-heading font-semibold text-stone-700 mt-0.5">Student Member</h4>
                            <p className="text-stone-600 font-medium text-xs mt-0.5">Ecological Society of America (ESA) - Aquatic Section</p>
                            <p className="text-xs text-stone-500 mt-1">Volunteered at regional student seminar webinars, tracking community ordination models of tropical estuaries.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 2B: VIDEO RESUME */}
        {activeSection === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.video} 
              id="video" 
              className="py-20 md:py-24 bg-slate-50 border-b border-slate-200 relative overflow-hidden"
            >
          <div className="absolute top-[-40px] left-[-40px] w-48 h-48 opacity-[0.03] pointer-events-none text-emerald-800">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50,10 C40,30 20,40 10,60 C20,80 40,90 50,90 C60,90 80,80 90,60 C80,40 60,30 50,10 Z" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <Video className="w-4 h-4 text-[#2A5C4A]" />
                <span>01B. Interactive Pitch</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Video Resume
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-xs sm:text-sm mt-4 text-center">
                Watch my academic pitch or configure your own custom YouTube linkage below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Playable Iframe with custom URL state handlers */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-full">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#3A7CA5] uppercase tracking-wider block">
                      Active Stream Platform • {videoUrl.includes("drive.google.com") ? "Google Drive Embed" : "YouTube Player"}
                    </span>
                    
                    {/* Settings Switcher */}
                    <button
                      onClick={() => {
                        setIsEditingVideo(!isEditingVideo);
                        setTempVideoUrl(videoUrl);
                      }}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 hover:border-[#2A5C4A] hover:bg-emerald-50 rounded-lg text-[10px] font-bold text-stone-700 hover:text-[#2A5C4A] transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isEditingVideo ? "Cancel" : "Configure Video"}</span>
                    </button>
                  </div>

                  {/* Stateful Editor Panel */}
                  <AnimatePresence>
                    {isEditingVideo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4"
                      >
                        {/* Tab selection toggles */}
                        <div className="flex border-b border-emerald-200/60 pb-1.5 gap-2">
                          <button
                            type="button"
                            onClick={() => setVideoConfigMode("drive")}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                              videoConfigMode === "drive"
                                ? "bg-[#2A5C4A] text-white"
                                : "text-stone-600 hover:text-[#2A5C4A] hover:bg-emerald-50"
                            }`}
                          >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>Google Drive</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoConfigMode("youtube")}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                              videoConfigMode === "youtube"
                                ? "bg-[#2A5C4A] text-white"
                                : "text-stone-600 hover:text-[#2A5C4A] hover:bg-emerald-50"
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>YouTube Link</span>
                          </button>
                        </div>

                        {/* TAB 1: GOOGLE DRIVE ACCESS */}
                        {videoConfigMode === "drive" && (
                          <div className="space-y-4">
                            {isAuthChecking ? (
                              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                                <Loader2 className="w-6 h-6 text-[#2A5C4A] animate-spin" />
                                <span className="text-xs text-stone-500 font-medium">Checking authorization...</span>
                              </div>
                            ) : !driveUser ? (
                              <div className="space-y-3">
                                <p className="text-xs text-stone-600 font-medium leading-relaxed">
                                  Connect your Google Drive securely to search and select your research video files directly from Google cloud storage.
                                </p>
                                <button
                                  type="button"
                                  onClick={handleGoogleDriveSignIn}
                                  disabled={driveLoading}
                                  className="w-full flex items-center justify-center bg-white border border-slate-300 rounded-lg py-2.5 px-4 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer select-none font-sans font-semibold text-stone-700 text-xs disabled:opacity-65"
                                >
                                  {driveLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#2A5C4A]" />
                                  ) : (
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="block h-4 w-4 mr-3 shrink-0">
                                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                      <path fill="none" d="M0 0h48v48H0z"></path>
                                    </svg>
                                  )}
                                  <span>{driveLoading ? "Connecting..." : "Sign in with Google"}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Auth details */}
                                <div className="flex items-center justify-between bg-white p-2 border border-slate-150 rounded-xl">
                                  <div className="flex items-center space-x-2 min-w-0">
                                    {driveUser.photoURL ? (
                                      <img src={driveUser.photoURL} alt={driveUser.displayName || ""} className="w-6 h-6 rounded-full border border-slate-100" referrerPolicy="no-referrer" />
                                    ) : (
                                      <User className="w-6 h-6 p-0.5 rounded-full bg-slate-100 text-stone-600" />
                                    )}
                                    <div className="truncate text-[10px] pr-2">
                                      <p className="font-semibold text-stone-700 truncate leading-tight">{driveUser.displayName || "Google User"}</p>
                                      <p className="text-stone-400 truncate leading-none">{driveUser.email}</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleGoogleDriveSignOut}
                                    className="p-1 px-2 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center space-x-1 shrink-0"
                                    title="Sign Out"
                                  >
                                    <LogOut className="w-3 h-3" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                  </button>
                                </div>

                                {/* Custom Video Search Box */}
                                <form onSubmit={handleSearchDriveVideos} className="flex gap-2">
                                  <div className="relative flex-grow">
                                    <input
                                      type="text"
                                      placeholder="Search videos..."
                                      value={driveSearchQuery}
                                      onChange={(e) => setDriveSearchQuery(e.target.value)}
                                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-emerald-300"
                                    />
                                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={driveLoading}
                                    className="px-3 py-1.5 bg-[#2A5C4A] text-white hover:bg-[#1a3a2f] rounded-lg text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-60"
                                  >
                                    Search
                                  </button>
                                </form>

                                {/* Drive Videos List */}
                                <div className="space-y-2">
                                  {driveLoading ? (
                                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                                      <Loader2 className="w-5 h-5 text-[#2A5C4A] animate-spin" />
                                      <span className="text-[10px] text-stone-500">Retrieving files...</span>
                                    </div>
                                  ) : driveError ? (
                                    <div className="text-center p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px]">
                                      <p className="font-semibold">{driveError}</p>
                                      <button
                                        type="button"
                                        onClick={() => driveToken && handleFetchDriveVideos(driveToken, driveSearchQuery)}
                                        className="mt-1.5 underline font-bold cursor-pointer hover:text-red-700"
                                      >
                                        Retry
                                      </button>
                                    </div>
                                  ) : driveVideos.length === 0 ? (
                                    <div className="text-center py-6 px-4 bg-white border border-slate-150 rounded-xl text-stone-500 text-[10px]">
                                      <FileVideo className="w-5 h-5 mx-auto text-stone-300 mb-1.5" />
                                      <p className="font-semibold">No Video Files Found</p>
                                      <p className="text-stone-400 mt-0.5">Upload a video containing file to your Google Drive, then search again.</p>
                                    </div>
                                  ) : (
                                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                      {driveVideos.map((file) => {
                                        const fileEmbedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
                                        const isSelected = videoUrl === fileEmbedUrl;
                                        return (
                                          <button
                                            key={file.id}
                                            type="button"
                                            onClick={() => {
                                              setVideoUrl(fileEmbedUrl);
                                              setTempVideoUrl(fileEmbedUrl);
                                              try {
                                                localStorage.setItem("noman_video_resume_url", fileEmbedUrl);
                                              } catch (err) {
                                                console.warn(err);
                                              }
                                              setIsEditingVideo(false);
                                            }}
                                            className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                                              isSelected 
                                                ? "bg-emerald-50/80 border-[#2A5C4A] text-[#2A5C4A] font-semibold" 
                                                : "bg-white hover:bg-slate-50 border-slate-150 text-stone-700"
                                            }`}
                                          >
                                            <div className="flex items-center space-x-2 min-w-0 pr-2">
                                              {file.thumbnailLink ? (
                                                <img src={file.thumbnailLink} alt="" className="w-8 h-8 rounded-md object-cover bg-slate-100 shrink-0 border border-slate-100" referrerPolicy="no-referrer" />
                                              ) : (
                                                <FileVideo className={`w-5 h-5 shrink-0 ${isSelected ? "text-[#2A5C4A]" : "text-stone-400"}`} />
                                              )}
                                              <div className="truncate">
                                                <p className="truncate font-semibold text-[11px] leading-snug">{file.name}</p>
                                                <p className="text-[9px] text-stone-400 font-normal">
                                                  {file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB` : "Unknown Size"} • {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : "Unknown date"}
                                                </p>
                                              </div>
                                            </div>
                                            {isSelected ? (
                                              <Check className="w-4 h-4 text-[#2A5C4A] shrink-0" />
                                            ) : (
                                              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Privacy guidance alert banner (least-privilege/view access advice) */}
                                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start space-x-2">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <div className="text-[10px] text-amber-800 leading-normal">
                                    <strong className="font-semibold">Privacy Tip:</strong> Google Drive files are private by default. For portfolio visitors to see this video, click <strong>"Share"</strong> on this file in Google Drive and configure access to <strong>"Anyone with the link can view"</strong>.
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 2: YOUTUBE LINK FALLBACK */}
                        {videoConfigMode === "youtube" && (
                          <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-[#2A5C4A] uppercase tracking-wide">
                              Paste YouTube URL or Embed link:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="e.g. https://www.youtube.com/watch?v=Q0A6B-K6t20"
                                value={tempVideoUrl}
                                onChange={(e) => setTempVideoUrl(e.target.value)}
                                className="flex-grow px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-emerald-300"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  let finalUrl = tempVideoUrl;
                                  if (tempVideoUrl.includes("watch?v=")) {
                                    const parts = tempVideoUrl.split("v=");
                                    if (parts[1]) {
                                      const id = parts[1].split("&")[0];
                                      finalUrl = `https://www.youtube.com/embed/${id}`;
                                    }
                                  } else if (tempVideoUrl.includes("youtu.be/")) {
                                    const parts = tempVideoUrl.split("youtu.be/");
                                    if (parts[1]) {
                                      const id = parts[1].split("?")[0];
                                      finalUrl = `https://www.youtube.com/embed/${id}`;
                                    }
                                  }
                                  
                                  setVideoUrl(finalUrl);
                                  setTempVideoUrl(finalUrl);
                                  try {
                                    localStorage.setItem("noman_video_resume_url", finalUrl);
                                  } catch (err) {
                                    console.warn(err);
                                  }
                                  setIsEditingVideo(false);
                                }}
                                className="bg-[#2A5C4A] hover:bg-[#1e4235] text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                              >
                                Save
                              </button>
                            </div>
                            <p className="text-[9px] text-stone-500">
                              * Supports standard watch URLs and shortlinks. Saves persistently in your client session memory.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Iframe Frame */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-900 shadow-md border border-slate-200">
                    <iframe
                      src={videoUrl}
                      title="Abdullah Al Noman Video CV"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-stone-600">Dynamic Stream Source</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-sm">
                    Status: Interactive
                  </span>
                </div>

              </div>

              {/* Right Column: Elevator Pitch Outline & Timestamp Seeker */}
              <div className="lg:col-span-5 bg-[#F8F9FA] border border-slate-200 rounded-2xl p-6 flex flex-col justify-between h-full">
                
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-[#2A5C4A]">
                    Academic Pitch Highlights
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Click any timestamp below to seek directly into that segment of my academic outline:
                  </p>

                  <div className="space-y-3.5 pt-2">
                    
                    {[
                      { 
                        time: "0:00", 
                        seconds: 0,
                        title: "Introduction & Motivation", 
                        desc: "Brief background on growing up close to major river basins and developing my deep passion for fisheries."
                      },
                      { 
                        time: "0:45", 
                        seconds: 45,
                        title: "Undergraduate Insights & High CGPA", 
                        desc: "How maintaining a 3.92 CGPA (Departmental 1st Rank) reflects rigorous scientific devotion."
                      },
                      { 
                        time: "1:30", 
                        seconds: 90,
                        title: "Wetland Ecology & Quantitative Modeling", 
                        desc: "Primary highlights of multivariate statistics, NMDS ordination, and R package pipelines."
                      },
                      { 
                        time: "2:15", 
                        seconds: 135,
                        title: "PhD Goals & Global Collaborations", 
                        desc: "Articulating research targets in North America, Europe, or Australia, and final academic summary."
                      }
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        onClick={() => {
                          const baseUrl = videoUrl.split("?")[0].split("&")[0];
                          const newUrl = `${baseUrl}?start=${item.seconds}&autoplay=1`;
                          setVideoUrl(newUrl);
                        }}
                        className="group flex gap-4 p-3 bg-white hover:bg-[#EBF6F0]/50 border border-slate-150 hover:border-[#2A5C4A] rounded-xl cursor-pointer transition-all duration-200"
                        title="Click to jump to this timestamp"
                      >
                        <div className="w-12 h-10 bg-slate-105 group-hover:bg-[#2A5C4A] text-[#2A5C4A] group-hover:text-white rounded-lg flex items-center justify-center font-mono text-xs font-extrabold shadow-3xs transition-colors shrink-0">
                          <Play className="w-3 h-3 mr-0.5" />
                          <span>{item.time}</span>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-heading font-semibold text-xs text-[#2A5C4A] group-hover:text-[#3A7CA5] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10.5px] leading-snug text-stone-500 font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                <div className="mt-6 p-3.5 bg-[#EBF6F0]/60 border border-emerald-100 rounded-xl flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-[#2A5C4A] shrink-0" />
                  <span className="text-[10px] text-emerald-800 leading-snug font-medium">
                    This interactive index targets custom timestamps dynamically. Customize this resource above inside the session.
                  </span>
                </div>

              </div>

            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 3: KEY RESEARCH INTERESTS & STUDY DOMAINS (BENTO CARD DISPLAY) */}
        {activeSection === "interests" && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.interests} 
              id="interests" 
              className="py-20 md:py-24 bg-[#F8F9FA] relative border-b border-slate-200"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <Activity className="w-4 h-4 text-[#2A5C4A]" />
                <span>02. Scientific Horizons</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Focal Research Domains
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-sm max-w-xl mx-auto mt-4">
                These core topics represent my active scientific exploration and form the fundamental focus of my targeted PhD dissertation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-all group hover:border-[#2A5C4A]">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#2A5C4A] flex items-center justify-center mb-5 group-hover:bg-[#2A5C4A] group-hover:text-white transition-all">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-base text-[#2A5C4A] mb-2">Tropical Floodplain Limnology</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Analyzing water chemistry variables, nutrient loads, sediment pulses, and physical factors in flood-prone Asian deltas and seasonal floodplains.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-all group hover:border-[#2A5C4A]">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#2A5C4A] flex items-center justify-center mb-5 group-hover:bg-[#2A5C4A] group-hover:text-white transition-all">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-base text-[#2A5C4A] mb-2">Biological Invasions</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Investigating biological mechanisms, dietary niches and spatial behavior of non-native exotics (e.g., suckermouth catfishes) in native zones.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-all group hover:border-[#2A5C4A]">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#2A5C4A] flex items-center justify-center mb-5 group-hover:bg-[#2A5C4A] group-hover:text-white transition-all">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-base text-[#2A5C4A] mb-2">Habitat Fragmentation</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Evaluating how spatial dams, diversion structures and low barrages alter fish migration indices and reduce taxonomic connectivity.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-all group hover:border-[#2A5C4A]">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#2A5C4A] flex items-center justify-center mb-5 group-hover:bg-[#2A5C4A] group-hover:text-white transition-all">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-base text-[#2A5C4A] mb-2">Evidence-Based Conservation</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Synthesizing primary metrics to establish sustainable dry-season river fish sanctuaries and restore critically threatened South Asian river fauna.
                </p>
              </div>

            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 4: SELECTED RESEARCH EXPERIENCE */}
        {activeSection === "research" && (
          <motion.div
            key="research"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.research} 
              id="research" 
              className="py-20 md:py-24 bg-white"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <Compass className="w-4 h-4 text-[#2A5C4A]" />
                <span>03. Empirical Investigations</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Research Experience
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-sm max-w-md mx-auto mt-4 col-span-3">
                Selected peer-reviewed manuscript projects and intensive field initiatives from my undergraduate lab curriculum.
              </p>
            </div>

            {/* THREE PROJECT CARDS - Custom-aligned to match academic standards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Project Card 1 */}
              <div className="bg-[#F8F9FA] rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#2A5C4A] group transition-all duration-300 flex flex-col h-full">
                
                {/* Visual Unsplash Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
                  {/* IMAGE COMMENT: Abdullah, replace with custom Padma / Chalan Beel fieldwork photo */}
                  <img 
                    src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600" 
                    alt="Wetland sampling in Chalan Beel" 
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-[#2A5C4A] text-white text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs">
                    In Prep / Manuscript
                  </div>
                </div>

                {/* Card Context */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div>
                    <span className="font-mono text-[9px] text-[#3A7CA5] font-bold tracking-widest uppercase block mb-1">
                      Lead Student Researcher, Independent Project
                    </span>
                    <h3 className="font-heading font-semibold text-base text-[#2A5C4A] group-hover:text-[#3A7CA5] transition-colors leading-snug line-clamp-2">
                      Flood-Pulse Dynamics and Fish Assemblage Structure in Chalan Beel Floodplain Wetlands
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-[#2D3E40] flex-grow">
                    <p>
                      <strong className="text-stone-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">The Question</strong>
                      "How do seasonal flood peaks affect species richness, trophic parity, and community dominance across fragmented floodplain channels?"
                    </p>
                    <p>
                      <strong className="text-stone-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">The Method</strong>
                      We sampled fish assemblages during monsoon peaks using <strong>experimental gillnets and cast nets</strong> combined with multivariate ordination in R.
                    </p>
                    <p className="bg-white p-3 rounded-lg border-l-2 border-[#3A7CA5] italic">
                      <strong className="text-[#2A5C4A] font-bold block not-italic text-[9px] uppercase tracking-wider mb-0.5">Key Finding</strong>
                      Annual pulse intensity is the strongest predictor of community nestedness, ensuring critical migratory pathways for vulnerable native species.
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-2 shrink-0">
                    {["Wetland Sampling", "R Statistics", "Community Ecology", "Ordination"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white text-stone-600 rounded-md font-mono text-[9px] uppercase font-bold border border-slate-100 shadow-3xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Card 2 */}
              <div className="bg-[#F8F9FA] rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#2A5C4A] group transition-all duration-300 flex flex-col h-full">
                
                {/* Visual Unsplash Image 2 */}
                <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
                  {/* IMAGE COMMENT: Abdullah, replace with custom photo of fish dissection / identification */}
                  <img 
                    src="https://images.unsplash.com/photo-1505903658795-8d3cc48039e4?w=600" 
                    alt="Exotics and invasive species biology research" 
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-cyan-700 text-white text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs">
                    Research Assistant
                  </div>
                </div>

                {/* Card Context */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div>
                    <span className="font-mono text-[9px] text-[#3A7CA5] font-bold tracking-widest uppercase block mb-1">
                      Research Assistant, Departmental Team
                    </span>
                    <h3 className="font-heading font-semibold text-base text-[#2A5C4A] group-hover:text-[#3A7CA5] transition-colors leading-snug line-clamp-2">
                      Microhabitat Partitioning of Crypobenthic Fish Communities in Marginal Shore Zones
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-[#2D3E40] flex-grow">
                    <p>
                      <strong className="text-stone-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">The Question</strong>
                      "What specific vegetative structures support high juvenile fish recruitment in hyper-turbid river segments?"
                    </p>
                    <p>
                      <strong className="text-stone-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">The Method</strong>
                      Quantified microhabitat structural complexity using <strong>high-resolution spatial grids and quadrat-based echosounding</strong>.
                    </p>
                    <p className="bg-white p-3 rounded-lg border-l-2 border-[#3A7CA5] italic">
                      <strong className="text-[#2A5C4A] font-bold block not-italic text-[9px] uppercase tracking-wider mb-0.5">Key Finding</strong>
                      Complex root stems of aquatic macrophytes reduce local predation mortality by 74% compared to open river channels.
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-2 shrink-0">
                    {["QGIS Workmaps", "Microhabitats", "Field Zoology", "Predation Models"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white text-stone-600 rounded-md font-mono text-[9px] uppercase font-bold border border-slate-100 shadow-3xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Card 3 */}
              <div className="bg-[#F8F9FA] rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#2A5C4A] group transition-all duration-300 flex flex-col h-full">
                
                {/* Visual Unsplash Image 3 */}
                <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
                  {/* IMAGE COMMENT: Abdullah, replace with custom photo of community meeting / wetland reserve */}
                  <img 
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600" 
                    alt="Community wetland conservation reserve" 
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-orange-700 text-white text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs">
                    Honors Seminar Lecture
                  </div>
                </div>

                {/* Card Context */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div>
                    <span className="font-mono text-[9px] text-[#3A7CA5] font-bold tracking-widest uppercase block mb-1">
                      Co-Investigator, Undergrad Honors Thesis
                    </span>
                    <h3 className="font-heading font-semibold text-base text-[#2A5C4A] group-hover:text-[#3A7CA5] transition-colors leading-snug line-clamp-2">
                      Community-Led Aquatic Conservation and Socio-Ecological Synergy in Reserve Sanctuaries
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-[#2D3E40] flex-grow">
                    <p>
                      <strong className="text-stone-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">The Question</strong>
                      "Can sustainable local fishing gear regulations successfully recover depleted native finfish biomass while supporting community livelihood?"
                    </p>
                    <p>
                      <strong className="text-stone-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">The Method</strong>
                      Conducted <strong>semi-structured household surveys integrated with dry-season catch-per-unit-effort (CPUE) biosampling</strong>.
                    </p>
                    <p className="bg-white p-3 rounded-lg border-l-2 border-[#3A7CA5] italic">
                      <strong className="text-[#2A5C4A] font-bold block not-italic text-[9px] uppercase tracking-wider mb-0.5">Key Finding</strong>
                      Community-monitored freshwater sanctuaries yielded a 2.5-fold increase in native predatory fish populations within three years.
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-2 shrink-0">
                    {["Socio-Ecology", "Wetland Sanctuaries", "CPUE sampling", "Livelihoods"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white text-stone-600 rounded-md font-mono text-[9px] uppercase font-bold border border-slate-100 shadow-3xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 5: TECHNICAL SKILLS & METHODS */}
        {activeSection === "skills" && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.skills} 
              id="skills" 
              className="py-20 md:py-24 bg-[#F8F9FA] border-t border-b border-slate-200"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <Code2 className="w-4 h-4 text-[#2A5C4A]" />
                <span>04. Professional Arsenal</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Technical Skills & Methods
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-xs sm:text-sm mt-4 text-center">
                Detailed inventory of laboratory techniques, field sampling methods and quantitative programming languages acquired throughout my university curriculum.
              </p>
            </div>

            {/* THREE COLUMNS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Column A: Field & Lab Methods */}
              <div className="p-6 bg-white rounded-2xl border border-slate-150 shadow-3xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2A5C4A] flex items-center justify-center shadow-3xs shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-[#2A5C4A]">
                    Field & Lab Methods
                  </h3>
                </div>
                
                <ul className="space-y-3.5">
                  {[
                    "Water quality sampling (DO, pH, salinity, turbidity probes)",
                    "Macroinvertebrate classification & index ecological profiling",
                    "Specimen preservation and taxonomic wet curation protocols",
                    "Microscopy work and morphological identification keys",
                    "Deploying standard gillnets, cast nets & spatial traps",
                    "Sediment core profiling & wetland vegetation transect audits"
                  ].map((skill, index) => (
                    <li key={index} className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2A5C4A] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm leading-snug">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column B: Data Analysis & Coding */}
              <div className="p-6 bg-white rounded-2xl border border-slate-150 shadow-3xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#3A7CA5] flex items-center justify-center shadow-3xs shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-[#2A5C4A]">
                    Data Analysis & Coding
                  </h3>
                </div>

                <ul className="space-y-3.5">
                  {[
                    "R Language fluency (tidyverse, ggplot2, vegan, lme4)",
                    "Python (pandas, NumPy, Matplotlib for biospatial analysis)",
                    "QGIS workflow for spatial site mapping & grid coordinates",
                    "Statistical modeling (linear regression, GLM, ANOVA, ANCOVA)",
                    "Multivariate ordination (PCA, NMDS, RDA for community files)",
                    "Reproducible notebook pipelines (RMarkdown & Jupyter Lab)"
                  ].map((skill, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2A5C4A] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm leading-snug">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column C: Academic & Communication */}
              <div className="p-6 bg-white rounded-2xl border border-slate-150 shadow-3xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-amber-700 flex items-center justify-center shadow-3xs shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-[#2A5C4A]">
                    Academic & Communication
                  </h3>
                </div>

                <ul className="space-y-3.5">
                  {[
                    "Scientific writing (co-author papers in active prep)",
                    "Academic layout building in LaTeX & Google Workspace",
                    "Bibliography workflow with Zotero and reference managers",
                    "Technical academic poster design and delivery protocols",
                    "Grant writing initiative (University Undergraduate Research Award)",
                    "Bilingual communication & public stakeholder engagement meetings"
                  ].map((skill, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2A5C4A] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm leading-snug">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 6: PUBLICATIONS & ACADEMIC PRESENTATIONS */}
        {activeSection === "publications" && (
          <motion.div
            key="publications"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.publications} 
              id="publications" 
              className="py-20 md:py-24 bg-white"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <BookOpen className="w-4 h-4 text-[#2A5C4A]" />
                <span>05. Scholarly Contributions</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Publications & Talks
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-xs sm:text-sm mt-4 text-center">
                Chronological list of scientific outputs, technical posters, and seminar presentations.
              </p>
            </div>

            {/* List entries with real-life Bangladesh ecological contexts */}
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Publication / Talk Item 1 */}
              <div className="bg-[#F8F9FA] p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-[#2A5C4A] hover:shadow-lg transition-all duration-350 relative group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-12 py-1 bg-emerald-50 text-[#2A5C4A] text-center text-xs font-mono font-bold uppercase rounded-md border border-emerald-100/50">
                      2025
                    </span>
                    <span className="px-2.5 py-1 bg-sky-50 text-[#3A7CA5] text-[10px] font-mono font-extrabold uppercase rounded-md">
                      Paper (In Prep)
                    </span>
                  </div>

                  <span className="text-xs font-mono text-stone-500 font-medium">
                    Target: Primary Aquatic Eco-Journals
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-lg sm:text-xl text-[#2A5C4A] mb-2 group-hover:text-[#3A7CA5] transition-colors leading-snug">
                  "Flood-Pulse Dynamics and Fish Assemblage Structure in Fragmented Floodplains of Chalan Beel, Bangladesh"
                </h3>
                
                <p className="text-sm text-stone-600 mb-3">
                  <span className="font-bold text-zinc-900">A. A. Noman</span>, Dr. S. M. Galib, and Prof. Samuel Drake. 
                </p>

                <div className="text-xs text-stone-500 border-l-2 border-emerald-300 pl-3 italic leading-relaxed">
                  Active co-authored study mapping monsoon flow variances and cyprinid nestedness across degraded inland floodplain inlets.
                </div>
              </div>

              {/* Publication / Talk Item 2 */}
              <div className="bg-[#F8F9FA] p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-[#2A5C4A] hover:shadow-lg transition-all duration-350 relative group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-12 py-1 bg-emerald-50 text-[#2A5C4A] text-center text-xs font-mono font-bold uppercase rounded-md border border-emerald-100/50">
                      2025
                    </span>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-850 text-[10px] font-mono font-extrabold uppercase rounded-md">
                      Technical Poster
                    </span>
                  </div>

                  <span className="text-xs font-mono text-[#3A7CA5] font-bold">
                    Presented • Biological Symposium Bangladesh
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-lg sm:text-xl text-[#2A5C4A] mb-2 group-hover:text-[#3A7CA5] transition-colors leading-snug">
                  "Impacts of Agricultural Runoff and Salinity Spikes on Native Cyprinidae Recruitment in Flood channels"
                </h3>

                <p className="text-sm text-stone-600 mb-3">
                  <span className="font-bold text-zinc-900">A. A. Noman</span> and Dr. S. M. Galib.
                </p>

                <div className="text-xs text-stone-500 border-l-2 border-emerald-300 pl-3 italic leading-relaxed">
                  Presented at the Department Undergraduate Research Colloquium. Won outstanding field poster recognition.
                </div>
              </div>

              {/* Publication / Talk Item 3 */}
              <div className="bg-[#F8F9FA] p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-[#2A5C4A] hover:shadow-lg transition-all duration-350 relative group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-12 py-1 bg-emerald-50 text-[#2A5C4A] text-center text-xs font-mono font-bold uppercase rounded-md border border-emerald-100/50">
                      2024
                    </span>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-800 text-[10px] font-mono font-extrabold uppercase rounded-md">
                      Seminar Talk
                    </span>
                  </div>

                  <span className="text-xs font-mono text-stone-500 font-medium">
                    Speaker • Seminar Colloquium
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-lg sm:text-xl text-[#2A5C4A] mb-2 group-hover:text-[#3A7CA5] transition-colors leading-snug">
                  "Biodiversity Assessment in Fragmented Aquascapes: Macroinvertebrate Indices versus Traditional Biomass Sampling"
                </h3>

                <p className="text-sm text-stone-600 mb-3">
                  Single Speaker Presentation: <span className="font-bold text-zinc-900">A. A. Noman</span>.
                </p>

                <div className="text-xs text-stone-500 border-l-2 border-emerald-300 pl-3 italic leading-relaxed">
                  Presented to the Department of Fisheries Colloquium Series. Addressed indexing models of tropical floodplain ecosystems.
                </div>
              </div>

            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 7: RESEARCH GALLERY (Signature of Galib's template portfolios) */}
        {activeSection === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.gallery} 
              id="gallery" 
              className="py-20 md:py-24 bg-[#F8F9FA] border-t border-b border-slate-200"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <ImageIcon className="w-4 h-4 text-[#2A5C4A]" />
                <span>06. Field & Laboratory Walks</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Field Research Gallery
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-xs sm:text-sm mt-4 text-center">
                Visual insights of actual field biosampling trips, dissecting microscopes, and quantitative computer analysis.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex justify-center space-x-2 mb-10 overflow-x-auto pb-2">
              {[
                { filter: "all", label: "Show All" },
                { filter: "field", label: "Field Sampling" },
                { filter: "lab", label: "Lab Work" },
                { filter: "code", label: "Code & Analytics" }
              ].map((btn) => (
                <button
                  key={btn.filter}
                  onClick={() => setGalleryFilter(btn.filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    galleryFilter === btn.filter 
                      ? "bg-[#2A5C4A] text-white shadow-md shadow-emerald-950/15" 
                      : "bg-white text-stone-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Gallery grid with smooth entry animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGallery.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-3xs group flex flex-col h-full hover:border-[#2A5C4A] hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      referrerPolicy="referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase text-[#2A5C4A] shadow-3xs border border-slate-100">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div className="space-y-1">
                      <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#2A5C4A] line-clamp-1 group-hover:text-[#3A7CA5] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-medium line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>
        </motion.div>
        )}

        {/* SECTION 7B: HOBBIES (TRAVELLING & PHOTOGRAPHY) */}
        {activeSection === "hobbies" && (
          <motion.div
            key="hobbies"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.hobbies} 
              id="hobbies" 
              className="py-20 md:py-24 bg-white relative"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                    <Camera className="w-4 h-4 text-[#2A5C4A]" />
                    <span>06. Travelogue & Biospatial Photography</span>
                  </span>
                  <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                    My Hobbies: Travelling & Photography
                  </h2>
                  <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
                  <p className="text-stone-500 text-xs sm:text-sm mt-4 text-center">
                    Documenting aquatic environments, inland river catchments, and native landscapes through my lenses.
                  </p>
                </div>

                {/* Grid of travel photos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {travelSpots.map((spot: any) => (
                    <div 
                      key={spot.id} 
                      className="bg-[#F8F9FA] rounded-2xl overflow-hidden border border-slate-150 hover:border-[#2A5C4A] shadow-3xs hover:shadow-md transition-all duration-300 flex flex-col group"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={spot.image} 
                          alt={spot.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300 cursor-pointer"
                          onClick={() => setActivePhoto(spot)}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-3xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-[#2A5C4A] shadow-3xs flex items-center space-x-1 border border-slate-100">
                          <MapPin className="w-3 h-3" />
                          <span>{spot.location}</span>
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-heading font-semibold text-base text-[#2A5C4A] group-hover:text-[#3A7CA5] transition-colors leading-snug">
                            {spot.title}
                          </h3>
                          <p className="text-xs text-stone-500 leading-relaxed font-medium">
                            {spot.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/65 flex items-center justify-between font-mono text-[9.5px] text-stone-400 font-semibold uppercase">
                          <span className="flex items-center space-x-1 text-[#3A7CA5]">
                            <Camera className="w-3.5 h-3.5 mr-1 shrink-0" />
                            {spot.camera}
                          </span>
                          <span>{spot.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty section state or trigger adder */}
                <div className="mt-16 text-center">
                  <button
                    onClick={() => setShowAddSpotModal(true)}
                    className="px-6 py-3.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-250 text-[#2A5C4A] rounded-xl font-heading font-bold text-xs uppercase tracking-wide transition-all shadow-3xs hover:shadow-xs cursor-pointer inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4 text-[#2A5C4A]" />
                    <span>Add New Travelling Footprint</span>
                  </button>
                </div>

              </div>
            </section>
          </motion.div>
        )}

        {/* SECTION 8: CONTACT */}
        {activeSection === "contact" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <section 
              ref={sectionRefs.contact} 
              id="contact" 
              className="py-20 md:py-24 bg-white relative border-t border-slate-150"
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center space-x-2 text-[#3A7CA5] font-mono text-xs font-bold uppercase tracking-widest">
                <Hash className="w-4 h-4 text-[#2A5C4A]" />
                <span>07. Let's Connect</span>
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#2A5C4A]">
                Academics Contact
              </h2>
              <div className="h-1 bg-[#3A7CA5] w-16 mx-auto mt-3 rounded-full"></div>
              <p className="text-stone-500 text-xs sm:text-sm mt-4 text-center">
                I am actively seeking PhD advisor pairings, graduate assistantships, or research collaboration. Drop me an email or reserve an online calendar slot.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Reach Out Box */}
              <div className="lg:col-span-5 space-y-8">
                <div className="bg-[#F8F9FA] p-6 sm:p-8 rounded-2xl border border-slate-200 flex flex-col justify-between h-fit space-y-6 shadow-sm">
                  
                  <div className="space-y-4">
                    <h3 className="font-heading font-semibold text-lg text-[#2A5C4A]">
                      PhD Advisor Communications
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                      If my research focus on flood-pulses, biodiversity data ordination or native freshwater sanctuaries meets your current research initiatives / lab vacancies, I would be pleased to schedule a discussion.
                    </p>
                  </div>

                  {/* Direct Contact Channels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#3A7CA5] uppercase tracking-wider block">
                        Direct Email
                      </span>
                      <div className="flex items-center space-x-2 p-3 bg-white border border-slate-200 rounded-xl justify-between shadow-3xs hover:border-[#3A7CA5] transition-all">
                        <a 
                          href={`mailto:${emailAddress}`}
                          className="text-[#2A5C4A] hover:text-[#3A7CA5] font-semibold text-xs font-mono truncate mr-2 focus:underline"
                          title="Draft email inside your default email client"
                        >
                          {emailAddress}
                        </a>
                        <button
                          onClick={handleCopyToClipboard}
                          className="p-1.5 text-stone-500 hover:text-[#2A5C4A] hover:bg-slate-50 rounded-lg cursor-pointer transition-colors shrink-0 relative flex items-center"
                          title="Copy academic email address to clipboard"
                          aria-label="Copy email address to clipboard"
                        >
                          {copiedEmail ? <span className="text-[10px] text-emerald-600 font-bold mr-1 animate-fade-in">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#3A7CA5] uppercase tracking-wider block">
                        Phone Contact
                      </span>
                      <div className="flex items-center space-x-2.5 p-3 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] transition-all justify-between shadow-3xs">
                        <a 
                          href="tel:+8801841424856"
                          className="text-[#2A5C4A] hover:text-[#3A7CA5] font-semibold text-xs font-mono flex items-center space-x-2 truncate"
                          title="Call phone number"
                        >
                          <Phone className="w-4 h-4 text-[#2A5C4A]" />
                          <span>+8801841424856</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Persistent Academic Profile Identifiers */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-mono font-bold text-[#3A7CA5] uppercase tracking-wider block">
                      Academic Profiles & Repositories
                    </span>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Google Scholar */}
                      <a 
                        href="https://scholar.google.com/citations?user=0QVj-bsAAAAJ&hl=en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center sm:space-x-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] hover:text-[#3A7CA5] transition-all text-center sm:text-left group text-xs"
                      >
                        <i className="fa-solid fa-graduation-cap text-[#2A5C4A] group-hover:text-[#3A7CA5] w-5 h-5 flex items-center justify-center text-xs"></i>
                        <span className="font-semibold text-[10px] sm:text-[11px] mt-1 sm:mt-0">Scholar</span>
                      </a>

                      {/* ResearchGate */}
                      <a 
                        href="https://www.researchgate.net/profile/Abdullah-Al-Noman-58?ev=hdr_xprf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center sm:space-x-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] hover:text-[#3A7CA5] transition-all text-center sm:text-left group text-xs"
                      >
                        <i className="fa-brands fa-researchgate text-[#2A5C4A] group-hover:text-[#3A7CA5] w-5 h-5 flex items-center justify-center text-xs"></i>
                        <span className="font-semibold text-[10px] sm:text-[11px] mt-1 sm:mt-0">ResearchGate</span>
                      </a>

                      {/* GitHub */}
                      <a 
                        href="https://github.com/n03an" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center sm:space-x-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] hover:text-[#3A7CA5] transition-all text-center sm:text-left group text-xs"
                      >
                        <Github className="w-4 h-4 text-[#2A5C4A] group-hover:text-[#3A7CA5]" />
                        <span className="font-semibold text-[10px] sm:text-[11px] mt-1 sm:mt-0">GitHub</span>
                      </a>
                    </div>
                  </div>

                  {/* Social Networks & Messaging */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-mono font-bold text-[#3A7CA5] uppercase tracking-wider block">
                      Social Profiles
                    </span>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Facebook */}
                      <a 
                        href="https://www.facebook.com/NomanInSitu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center sm:space-x-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] hover:text-[#3A7CA5] transition-all text-center sm:text-left group text-xs"
                      >
                        <Facebook className="w-4 h-4 text-[#2A5C4A] group-hover:text-[#3A7CA5]" />
                        <span className="font-semibold text-[10px] sm:text-[11px] mt-1 sm:mt-0">Facebook</span>
                      </a>

                      {/* LinkedIn */}
                      <a 
                        href="https://www.linkedin.com/in/-abdullah-al-noman/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center sm:space-x-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] hover:text-[#3A7CA5] transition-all text-center sm:text-left group text-xs"
                      >
                        <Linkedin className="w-4 h-4 text-[#2A5C4A] group-hover:text-[#3A7CA5]" />
                        <span className="font-semibold text-[10px] sm:text-[11px] mt-1 sm:mt-0">LinkedIn</span>
                      </a>

                      {/* Instagram */}
                      <a 
                        href="https://www.instagram.com/noman_in_situ/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center sm:space-x-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3A7CA5] hover:text-[#3A7CA5] transition-all text-center sm:text-left group text-xs"
                      >
                        <Instagram className="w-4 h-4 text-[#2A5C4A] group-hover:text-[#3A7CA5]" />
                        <span className="font-semibold text-[10px] sm:text-[11px] mt-1 sm:mt-0">Instagram</span>
                      </a>
                    </div>
                  </div>

                  {/* Calendly triggering button */}
                  {/* CALENDLY COMMENT: Abdullah, replace this simulated widget triggering button with your direct Calendly link or HTML script snippet */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowScheduler(!showScheduler)}
                      className="w-full py-3 bg-emerald-50 border border-emerald-250 text-[#2A5C4A] hover:bg-emerald-100/60 font-heading font-semibold rounded-xl text-center transition-all cursor-pointer flex items-center justify-center space-x-2 text-xs uppercase tracking-wide"
                    >
                      <Calendar className="w-4 h-4 text-[#2A5C4A]" />
                      <span>Or Schedule 15-Minute Zoom Chat</span>
                    </button>
                  </div>

                </div>

                {/* Simulated beautiful academic calendar scheduling modal */}
                <AnimatePresence>
                  {showScheduler && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="bg-white p-5 rounded-2xl border-2 border-[#2A5C4A] shadow-xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[#2A5C4A]">
                          <Calendar className="w-4 h-4" />
                          <span className="font-heading font-bold text-xs uppercase tracking-wider">Select Calendar Slot</span>
                        </div>
                        <button 
                          onClick={() => setShowScheduler(false)}
                          className="text-stone-400 hover:text-stone-600 font-bold p-1 hover:bg-stone-50 rounded-md cursor pointer text-sm"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleMockSchedule} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1.5 align-middle">1. Choose Date Offset</label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {availableDates.map((item) => (
                              <button
                                type="button"
                                key={item.date}
                                onClick={() => setSelectedDate(item.date)}
                                className={`p-1.5 rounded-lg text-center border text-[11px] cursor-pointer transition-all ${
                                  selectedDate === item.date
                                    ? "bg-[#2A5C4A] text-white border-[#2A5C4A] font-bold"
                                    : "bg-slate-50 hover:bg-slate-100 text-[#2D3E40] border-slate-200"
                                }`}
                              >
                                <span className="block font-bold">{item.day}</span>
                                <span className="text-[9px] text-stone-400 block" style={{color: selectedDate === item.date ? '#fff' : undefined}}>{item.date.split(" ")[1]}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">2. Choose Time (US EST)</label>
                          <div className="grid grid-cols-2 gap-2">
                            {availableTimes.map((t) => (
                              <button
                                type="button"
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`p-1.5 rounded-lg text-center border text-[10px] sm:text-xs cursor-pointer transition-all ${
                                  selectedTime === t
                                    ? "bg-[#3A7CA5] text-white border-[#3A7CA5] font-bold"
                                    : "bg-slate-50 hover:bg-sky-50 text-[#2D3E40] border-slate-200"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={!selectedDate || !selectedTime}
                            className={`w-full py-2.5 rounded-lg font-heading text-xs font-bold uppercase tracking-wider transition-colors text-center ${
                              selectedDate && selectedTime
                                ? "bg-[#2A5C4A] hover:bg-[#1e4235] text-white cursor-pointer shadow-md"
                                : "bg-stone-50 text-stone-400 cursor-not-allowed border-slate-200"
                            }`}
                          >
                            Request Meeting Slot
                          </button>
                        </div>
                      </form>

                      {scheduleSuccess && (
                        <div className="p-3 bg-emerald-50 text-[#2A5C4A] rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-100 animate-fade-in leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Slot pre-booked successfully! Confirmation sent to your inbox.</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Right Contact Form (Simulated, styled appropriately) */}
              <div className="lg:col-span-7 bg-[#F8F9FA] p-6 sm:p-10 rounded-2xl border border-slate-200">
                <h3 className="font-heading font-semibold text-lg sm:text-xl text-[#2A5C4A] mb-1">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-stone-500 mb-6">
                  Ready to send a letter? Fill in the details to simulate an academic communication transmission to my inbox.
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div className="space-y-1">
                      <label htmlFor="form-name" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="form-name"
                        required
                        placeholder="Dr. Samuel Vance"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-[#2A5C4A] outline-hidden text-xs sm:text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label htmlFor="form-email" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Your Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="form-email"
                        required
                        placeholder="s.vance@university.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-[#2A5C4A] outline-hidden text-xs sm:text-sm"
                      />
                    </div>

                  </div>

                  {/* Subject Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="form-subject" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Subject Line / Intent
                    </label>
                    <select
                      id="form-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-[#2A5C4A] outline-hidden text-xs sm:text-sm"
                    >
                      <option value="PhD Inquiry / Research Collaboration">PhD Advisorship Inquiry</option>
                      <option value="General Conversation / Advice">General Conversation / Ecology Advice</option>
                      <option value="Urgent Scientific Inquiry">Urgent Research Collaboration Opportunity</option>
                    </select>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1">
                    <label htmlFor="form-message" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Letter Body <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="form-message"
                      required
                      rows={5}
                      placeholder="Dear Abdullah, I reviewed your flood-dynamics findings in Chalan Beel. Let's schedule a Zoom call to discuss fully funded PhD openings in my ecological laboratory..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-[#2A5C4A] outline-hidden text-xs sm:text-sm resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formSubmitted}
                      className={`w-full py-3.5 px-6 font-heading font-semibold rounded-xl text-white tracking-wider uppercase text-xs transition-all flex items-center justify-center space-x-2 ${
                        formSubmitted 
                          ? "bg-slate-400 cursor-not-allowed" 
                          : "bg-[#2A5C4A] hover:bg-[#1e4235] cursor-pointer shadow-md hover:shadow-lg"
                      }`}
                    >
                      <span>{formSubmitted ? "Transmitting..." : "Send Message Securely"}</span>
                    </button>
                  </div>

                  {formSubmitted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50 text-[#2A5C4A] rounded-xl border border-emerald-100 flex items-start space-x-3 text-xs font-semibold leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Message sent locally!</p>
                        <p className="text-stone-500 font-medium mt-0.5">Mock transmission successful. (Actual backend endpoints can be integrated later by updating this state action).</p>
                      </div>
                    </motion.div>
                  )}

                </form>
              </div>

            </div>

          </div>
        </section>
        </motion.div>
        )}

      </main>

      {/* SECTION 9: FOOTER */}
      <footer className="bg-[#2A5C4A] text-white border-t border-emerald-950 py-12 relative overflow-hidden shrink-0">
        <div className="absolute top-[-30px] right-[-30px] w-64 h-64 opacity-[0.06] pointer-events-none text-emerald-300">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50,10 C40,30 20,40 10,60 C20,80 40,90 50,90 C60,90 80,80 90,60 C80,40 60,30 50,10 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-900/60">
            
            <div className="text-center md:text-left space-y-1">
              <span className="font-heading font-bold text-lg tracking-wider block uppercase">
                ABDULLAH AL NOMAN
              </span>
              <span className="text-emerald-200 font-mono text-[9px] tracking-widest uppercase block">
                University of Rajshahi • Department of Fisheries
              </span>
            </div>

            {/* Quick anchors */}
            <div className="flex space-x-4">
              {[
                { id: "about", label: "About" },
                { id: "interests", label: "Interests" },
                { id: "research", label: "Research" },
                { id: "skills", label: "Skills" },
                { id: "publications", label: "Publications" },
                { id: "contact", label: "Contact" }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id as keyof typeof sectionRefs)} 
                  className="text-emerald-100 hover:text-white hover:underline text-xs cursor-pointer font-semibold uppercase tracking-wider text-[10px]"
                >
                  {item.label}
                </button>
              ))}
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-emerald-250 font-medium">
            <p>© 2026 ABDULLAH AL NOMAN. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-mono">
              Last updated: June 15, 2026
            </p>
          </div>
        </div>
      </footer>

      {/* BACK TO TOP ARROW BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 p-3 bg-[#2A5C4A] hover:bg-[#1e4235] text-white rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-all z-50 text-center flex items-center justify-center border border-emerald-700/50"
            title="Scroll to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F8F9FA] rounded-2xl overflow-hidden max-w-4xl w-full border border-slate-700/50 shadow-2xl relative"
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 cursor-pointer transition-colors"
                title="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-8 bg-black flex items-center justify-center min-h-[300px] max-h-[550px] overflow-hidden">
                  <img
                    src={activePhoto.image}
                    alt={activePhoto.title}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="md:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold text-[#3A7CA5] uppercase bg-emerald-50 text-[#2A5C4A] border border-emerald-100 px-2.5 py-1 rounded-md">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {activePhoto.location}
                    </span>

                    <h3 className="font-heading font-bold text-xl text-[#2A5C4A] leading-snug">
                      {activePhoto.title}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">
                      {activePhoto.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/90 flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-400 capitalize">
                      <span>Camera Device:</span>
                      <span className="text-[#3A7CA5]">{activePhoto.camera}</span>
                    </div>
                    {activePhoto.settings && (
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-400">
                        <span>Settings profile:</span>
                        <span className="text-stone-600">{activePhoto.settings}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-400">
                      <span>Expetition date:</span>
                      <span className="text-stone-600">{activePhoto.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD SPOT FORM MODAL */}
      <AnimatePresence>
        {showAddSpotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddSpotModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 font-bold p-1 hover:bg-stone-50 rounded-lg cursor-pointer"
              >
                ✕
              </button>

              <div className="mb-6 space-y-1">
                <h3 className="font-heading font-bold text-lg text-[#2A5C4A]">Record New Travel Footprint</h3>
                <p className="text-xs text-stone-500 font-medium">Add a photography location, ecological info, and a spectacular photo link.</p>
              </div>

              <form onSubmit={handleAddSpot} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Spot / Topic Title</label>
                  <input
                    type="text"
                    value={newSpot.title}
                    onChange={(e) => setNewSpot({ ...newSpot, title: e.target.value })}
                    required
                    placeholder="e.g. Kaptai Lake Fish Sanctuary"
                    className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Geographical Location</label>
                    <input
                      type="text"
                      value={newSpot.location}
                      onChange={(e) => setNewSpot({ ...newSpot, location: e.target.value })}
                      required
                      placeholder="e.g. Rangamati, Bangladesh"
                      className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Camera gear</label>
                    <input
                      type="text"
                      value={newSpot.camera}
                      onChange={(e) => setNewSpot({ ...newSpot, camera: e.target.value })}
                      placeholder="e.g. Fujifilm X-T4"
                      className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Camera Settings parameters</label>
                    <input
                      type="text"
                      value={newSpot.settings}
                      onChange={(e) => setNewSpot({ ...newSpot, settings: e.target.value })}
                      placeholder="e.g. 50mm • f/2.0 • ISO 200"
                      className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Observation Date</label>
                    <input
                      type="text"
                      value={newSpot.date}
                      onChange={(e) => setNewSpot({ ...newSpot, date: e.target.value })}
                      placeholder="e.g. March 2026"
                      className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Spectacular image URL</label>
                  <input
                    type="url"
                    value={newSpot.image}
                    onChange={(e) => setNewSpot({ ...newSpot, image: e.target.value })}
                    required
                    placeholder="Provide image link starting with https://"
                    className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Scientific Observation details</label>
                  <textarea
                    value={newSpot.description}
                    onChange={(e) => setNewSpot({ ...newSpot, description: e.target.value })}
                    placeholder="What did you study during this excursion?"
                    className="w-full text-xs font-medium p-2.5 bg-[#F8F9FA] border border-slate-200 focus:outline-[#2A5C4A] rounded-xl h-20 resize-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSpotModal(false)}
                    className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-semibold rounded-xl text-center transition-all text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-[#2A5C4A] hover:bg-[#1a3a2f] text-white font-heading font-semibold rounded-xl text-center transition-all shadow-md text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Add Footprint
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

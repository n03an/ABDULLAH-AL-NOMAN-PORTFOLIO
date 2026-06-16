import React, { useState, useEffect } from "react";
import { 
  googleSignIn, 
  initAuth, 
  fetchDriveVideos, 
  logoutFromGoogle, 
  type DriveVideoFile 
} from "../lib/googleDrive";
import { User as FirebaseUser } from "firebase/auth";
import { 
  Search, 
  Video, 
  LogOut, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Play,
  FileVideo,
  Clock,
  HardDrive
} from "lucide-react";

interface GoogleDrivePickerProps {
  onVideoSelect: (videoUrl: string, fileName: string) => void;
  currentVideoUrl?: string;
}

export default function GoogleDrivePicker({ onVideoSelect, currentVideoUrl }: GoogleDrivePickerProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [videos, setVideos] = useState<DriveVideoFile[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSelected, setSuccessSelected] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsLoadingAuth(false);
        // Fetch videos automatically once authenticated
        loadVideos(token, searchQuery);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadVideos = async (token: string, search: string = "") => {
    setIsLoadingVideos(true);
    setErrorMsg(null);
    try {
      const response = await fetchDriveVideos(token, search);
      setVideos(response);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load videos from your Google Drive.");
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        await loadVideos(result.accessToken, searchQuery);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to authenticate with Google Drive.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setErrorMsg(null);
    try {
      await logoutFromGoogle();
      setCurrentUser(null);
      setAccessToken(null);
      setVideos([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to sign out.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadVideos(accessToken, searchQuery);
    }
  };

  const handleSelectFile = (file: DriveVideoFile) => {
    // Generate the standard preview link for iframes
    const driveEmbedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
    onVideoSelect(driveEmbedUrl, file.name);
    setSuccessSelected(file.id);
    setTimeout(() => setSuccessSelected(null), 3000);
  };

  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return "Unknown size";
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 text-[#2A5C4A] animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Checking authorization status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-start space-x-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Something went wrong</p>
            <p className="opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {!currentUser ? (
        <div className="text-center py-10 px-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#2A5C4A]">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-sm text-[#2A5C4A]">Enable Google Drive Access</h3>
            <p className="text-stone-500 text-xs max-w-sm">
              Connect your Google Drive with permission to safely browse your video files and select your video CV.
            </p>
          </div>

          <button 
            type="button" 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button text-xs font-semibold hover:shadow-md transition-shadow cursor-pointer w-full max-w-[260px]"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper flex items-center justify-center">
              <div className="gsi-material-button-icon shrink-0">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block", width: "16px", height: "16px" }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents ml-2">
                {isLoggingIn ? "Signing in..." : "Continue with Google"}
              </span>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Status Bar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-emerald-155 text-white flex items-center justify-center font-bold text-[10px] overflow-hidden">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || ""} />
                ) : (
                  <span>{currentUser.email?.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-stone-800 leading-tight">
                  {currentUser.displayName || "Connected"}
                </p>
                <p className="text-[10px] text-stone-400 font-medium leading-none">
                  {currentUser.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1 px-2 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-1 font-heading text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Disconnect</span>
            </button>
          </div>

          {/* Search bar specifically for Drive videos */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search video files in your Drive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-14 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-300"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 px-2.5 py-1 bg-[#2A5C4A] hover:bg-[#1a3a2f] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              Find
            </button>
          </form>

          {/* Video List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {isLoadingVideos ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="w-6 h-6 text-[#2A5C4A] animate-spin" />
                <span className="text-[10px] text-stone-400 font-medium">Scanning Google Drive...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                <FileVideo className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500 font-semibold">No video files found</p>
                <p className="text-[10px] text-stone-400 max-w-xs mx-auto mt-0.5">
                  We couldn't find any common video formats (MP4, MKV, MOV, WebM, etc.) in your Drive.
                </p>
              </div>
            ) : (
              videos.map((file) => {
                const isSelected = currentVideoUrl && currentVideoUrl.includes(file.id);
                const isSelectedJustNow = successSelected === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelectedJustNow 
                        ? "bg-emerald-50 border-emerald-400 scale-[0.99]" 
                        : isSelected 
                          ? "bg-emerald-50/40 border-emerald-250 hover:border-emerald-300" 
                          : "bg-white border-slate-150 hover:border-[#2A5C4A] hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Video representation / thumbnail if available */}
                      <div className="w-16 h-10 rounded bg-stone-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-100">
                        {file.thumbnailLink ? (
                          <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                        ) : (
                          <FileVideo className="w-5 h-5 text-emerald-400" />
                        )}
                        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center bg-black/20">
                          <Play className="w-3.5 h-3.5 text-white/90 fill-white/20" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-800 truncate leading-snug">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-medium whitespace-nowrap mt-0.5">
                          <span className="flex items-center space-x-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatDate(file.createdTime)}</span>
                          </span>
                          <span>•</span>
                          <span>{formatBytes(file.size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelectedJustNow ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : isSelected ? (
                        <span className="text-[9px] font-bold text-[#2A5C4A] bg-emerald-100/60 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                          Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2.5 py-1 border border-slate-200 hover:border-[#2A5C4A] hover:bg-emerald-50 text-stone-500 hover:text-[#2A5C4A] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Choose
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

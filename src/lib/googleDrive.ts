import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive Read-only scope
provider.addScope("https://www.googleapis.com/auth/drive.readonly");

// Keep state of signing in and token cache
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize OAuth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google using popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve access token from Google Auth.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Auth error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve current cached token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out / clear session
export const logoutFromGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Interface for Google Drive file metadata
export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
}

// Fetch list of video files from user's Google Drive
export const fetchDriveVideos = async (token: string, searchQuery: string = ""): Promise<DriveVideoFile[]> => {
  try {
    // Construct search query
    // Find all files that are videos and not in trash
    let q = "mimeType contains 'video/' and trashed = false";
    if (searchQuery) {
      // Escape single quotes for safety
      const escapedQuery = searchQuery.replace(/'/g, "\\'");
      q += ` and name contains '${escapedQuery}'`;
    }

    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.append("q", q);
    url.searchParams.append("fields", "files(id, name, mimeType, thumbnailLink, size, createdTime, webViewLink)");
    url.searchParams.append("orderBy", "createdTime desc");
    url.searchParams.append("pageSize", "30");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive API error: ${errText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching video files from Google Drive:", error);
    throw error;
  }
};

// js/accounts/auth.js
import { auth, provider } from './config.js';
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export class AuthManager {
    constructor() {
        this.user = null;
        this.unsubscribe = null;
        this.authListeners = [];
        this.init();
    }

    async init() {
        if (!auth) return;

        try {
            await setPersistence(auth, browserLocalPersistence);
        } catch (e) {
            console.error('Auth persistence error:', e);
        }

        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    console.log('Redirect sign-in success:', result.user);
                } else {
                    console.log('No redirect result found');
                }
            })
            .catch((error) => {
                console.error('Redirect sign-in failed:', error);
            });

        this.unsubscribe = onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.updateUI(user);
            this.authListeners.forEach((listener) => listener(user));
        });
    }

    onAuthStateChanged(callback) {
        this.authListeners.push(callback);
        if (this.user !== null) {
            callback(this.user);
        }
    }

    async signInWithGoogle() {
        if (!auth) {
            alert('Firebase is not configured.');
            return;
        }

        provider.setCustomParameters({
            prompt: 'select_account',
        });

        try {
            // ROBUST DETECTION: Check window.__TAURI__ OR Custom User Agent
            // This ensures we catch the Tauri environment even if injection fails
            const isTauri =
                (typeof window !== 'undefined' && window.__TAURI__ !== undefined) ||
                navigator.userAgent.includes('Monochrome_Tauri');

            console.log('Environment Detection - isTauri:', isTauri);

            if (isTauri) {
                console.log('Using Tauri Redirect Flow');
                await signInWithRedirect(auth, provider);
                return null;
            } else {
                console.log('Using Browser Popup Flow');
                const result = await signInWithPopup(auth, provider);
                return result.user;
            }
        } catch (error) {
            console.error('Login failed:', error);
            if (!navigator.userAgent.includes('Tauri')) {
                alert(`Login failed: ${error.message}`);
            }
            throw error;
        }
    }

    // ... email methods ...
    async signInWithEmail(email, password) {
        // ... (keep existing)
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw error;
        }
    }

    async signUpWithEmail(email, password) {
        // ... (keep existing)
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw error;
        }
    }

    async signOut() {
        // ... (keep existing)
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            throw error;
        }
    }

    updateUI(user) {
        // ... (keep existing UI logic)
        const connectBtn = document.getElementById('firebase-connect-btn');
        // ...
        if (user) {
            if (connectBtn) {
                connectBtn.textContent = 'Sign Out';
                connectBtn.onclick = () => this.signOut();
            }
            // ...
        } else {
            if (connectBtn) {
                connectBtn.textContent = 'Connect with Google';
                connectBtn.onclick = () => this.signInWithGoogle();
            }
            // ...
        }
    }
}

export const authManager = new AuthManager();

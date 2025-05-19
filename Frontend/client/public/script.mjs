import { login, logout, isAuthenticated, initializeAuth, loadUserFromSession } from "./auth.mjs";
import { searchMovies } from "./search.mjs";
import { togglePasswordVisibility, updateAuthUI, closeModal, handleMovieSearch, toggleTheme } from "./ui.mjs";

const isBrowser = typeof window !== "undefined";
const isNode = typeof window === "undefined";

if (isBrowser) {
  // Event listener for search input
  searchMovies();
}

// Register the service worker in the browser environment
if (isBrowser && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js",
        {
          scope: '/'
        }
      );
      console.log("Service Worker registered with scope:", registration.scope);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
}

if (isBrowser) {
  document.addEventListener("DOMContentLoaded", function () {
    
    handleMovieSearch();
    toggleTheme();
    togglePasswordVisibility();
    updateAuthUI();
    initializeAuth();
    loadUserFromSession();

    // Settings modal
    const settingsLink = document.getElementById("settingsLink");
    if (settingsLink) {
      settingsLink.addEventListener("click", function (e) {
        e.preventDefault();
        const settingsModal = new window.bootstrap.Modal(
          document.getElementById("settingsModal")
        );
        settingsModal.show();
      });
    }

    // Profile modal
    const profileLink = document.getElementById("profileLink");
    if (profileLink) {
      profileLink.addEventListener("click", function (e) {
        e.preventDefault();
        const profileModal = new window.bootstrap.Modal(
          document.getElementById("profileModal")
        );
        profileModal.show();
      });
    }

    // Initialize auth buttons event listeners
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        login(username, password);
      });
    }

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
      logoutLink.addEventListener("click", logout);
    }
  }, {once: true});
}

if (isBrowser) {
  document
    .getElementById("saveSettingsBtn")
    .addEventListener("click", function () {
      const emailNotifications =
        document.getElementById("emailNotifications").checked;
      const discordNotifications = document.getElementById(
        "discordNotifications"
      ).checked;
      const voteLimit = document.getElementById("voteLimit").value;
      const votingDeadline = document.getElementById("votingDeadline").value;
      const theme = document.getElementById("themeSelector").value;
      const feedback = document.getElementById("feedback").value;

      console.log({
        emailNotifications,
        discordNotifications,
        voteLimit,
        votingDeadline,
        theme,
        feedback,
      });

      window.bootstrap.Modal.getInstance(
        document.getElementById("settingsModal")
      );
    });
}


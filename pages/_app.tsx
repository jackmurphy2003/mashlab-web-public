import React from "react";
import type { AppProps } from "next/app";
import Navigation from "../src/components/Navigation";
import "../src/index.css";

export default function App({ Component, pageProps }: AppProps) {
  const [activeTab, setActiveTab] = React.useState<"search" | "library" | "mashups" | "copilot">("search");

  // Handle URL-based routing for redirects
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/recommender') {
      setActiveTab('mashups');
      window.history.replaceState(null, '', '/mashups');
    } else if (path === '/callback') {
      // Don't change the tab, just render the callback page
      return;
    } else if (path === '/copilot') {
      setActiveTab('copilot');
    } else if (path === '/library') {
      setActiveTab('library');
    } else if (path === '/mashups') {
      setActiveTab('mashups');
    } else if (path === '/') {
      setActiveTab('search');
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0C1022" }}>
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-8">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <Component {...pageProps} />
        
        {/* Footer with GetSongBPM backlink */}
        <footer className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            BPM data by{" "}
            <a 
              href="https://getsongbpm.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              GetSongBPM
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

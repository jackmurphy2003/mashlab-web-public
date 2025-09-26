import React from "react";
import SearchPage from "./SearchPage";
import LibraryPage from "./LibraryPage";
import MashupsPage from "./MashupsPage";
import CallbackPage from "./CallbackPage";
import CopilotPage from "./CopilotPage";

import Navigation from "./components/Navigation";

export default function App() {
  // Simple state management
  const [activeTab, setActiveTab] = React.useState<"search" | "library" | "mashups" | "copilot">("search");

  // Initialize from localStorage
  React.useEffect(() => {
    const savedTab = localStorage.getItem('mashlab-active-tab') as "search" | "library" | "mashups" | "copilot" | null;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Create a stable ref to store the handler
  const handleTabChangeRef = React.useRef<(tab: "search" | "library" | "mashups" | "copilot") => void>();

  // Simple tab change handler
  const handleTabChange = React.useCallback((tab: "search" | "library" | "mashups" | "copilot") => {
    console.log('🔄 Tab change requested:', tab);
    console.log('🔄 Current activeTab before change:', activeTab);
    setActiveTab(tab);
    localStorage.setItem('mashlab-active-tab', tab);
    console.log('🔄 setActiveTab called with:', tab);
  }, [activeTab]);

  // Store the handler in the ref
  handleTabChangeRef.current = handleTabChange;

  // Track activeTab changes
  React.useEffect(() => {
    console.log('📱 activeTab state changed to:', activeTab);
  }, [activeTab]);

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
      window.history.replaceState(null, '', '/copilot');
    }
  }, []);

  // Render content based on active tab
  const renderContent = () => {
    console.log('🎨 renderContent called with activeTab:', activeTab);
    switch (activeTab) {
      case "search":
        console.log('🎨 Rendering SearchPage');
        return <SearchPage />;
      case "library":
        console.log('🎨 Rendering LibraryPage');
        return <LibraryPage />;
      case "mashups":
        console.log('🎨 Rendering MashupsPage');
        return <MashupsPage />;
      case "copilot":
        console.log('🎨 Rendering CopilotPage');
        return <CopilotPage />;
      default:
        console.log('🎨 Rendering SearchPage (default)');
        return <SearchPage />;
    }
  };

  console.log('🚀 App component rendering with activeTab:', activeTab);
  console.log('🔧 handleTabChange function:', handleTabChange);
  console.log('🔧 handleTabChangeRef.current:', handleTabChangeRef.current);
  
  return (
    <div className="min-h-screen" style={{ background: "#0C1022" }}>
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-8">
          <Navigation activeTab={activeTab} onTabChange={handleTabChangeRef.current!} />
        </div>
        
        {window.location.pathname === '/callback' ? (
          <CallbackPage />
        ) : (
          <>
            <div style={{
              color: 'white',
              marginBottom: '10px',
              fontSize: '14px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '8px',
              borderRadius: '4px'
            }}>
              🔍 DEBUG: Active Tab: <strong>{activeTab}</strong>
            </div>
            {renderContent()}
          </>
        )}
      </div>
    </div>
  );
}
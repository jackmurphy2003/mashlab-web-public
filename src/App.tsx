import React from "react";
import SearchPage from "./SearchPage";
import LibraryPage from "./LibraryPage";
import MashupsPage from "./MashupsPage";
import CallbackPage from "./CallbackPage";
import CopilotPage from "./CopilotPage";

import Navigation from "./components/Navigation";

export default function App() {
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
      window.history.replaceState(null, '', '/copilot');
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0C1022" }}>
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-8">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {window.location.pathname === '/callback' ? (
          <CallbackPage />
        ) : (
          <>
            {activeTab === "search" && <SearchPage />}
            {activeTab === "library" && <LibraryPage />}
            {activeTab === "mashups" && <MashupsPage />}
            {activeTab === "copilot" && <CopilotPage />}
          </>
        )}
      </div>
    </div>
  );
}

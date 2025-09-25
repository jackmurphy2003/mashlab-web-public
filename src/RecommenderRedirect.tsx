import React from 'react';

export default function RecommenderRedirect() {
  React.useEffect(() => {
    // Redirect to mashups
    window.location.href = '/mashups';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0C1022" }}>
      <div className="text-white text-xl">Redirecting to Mashups...</div>
    </div>
  );
}

import React, { useState } from "react";

const ServiceOutageBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        {/* Icon */}
        <span className="text-amber-500 text-xl mt-0.5 shrink-0">⚠️</span>

        {/* Text */}
        <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
          <span className="font-semibold">Service Notice: </span>
          This app's backend services (Azure) are
          currently offline as the student cloud credits used for this
          project have expired. Some features like loading posts, uploading
          images, and user profiles may not work.{" "}
          <span className="italic opacity-75">
             Built with React, Node.js, Auth0, Azure &amp; OpenAI. (Restoring services soon!)
          </span>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 text-lg font-bold shrink-0 leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ServiceOutageBanner;
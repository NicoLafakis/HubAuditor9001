interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>

        {/* Loading message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>

        {/* Sub-message */}
        <p className="text-gray-600 max-w-md">
          This may take a few moments while we analyze your HubSpot data...
        </p>

        {/* Progress steps */}
        <div className="mt-8 space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Fetching data from HubSpot</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-100"></div>
            <span>Calculating metrics</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
            <span>Generating AI analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          Sit tight! We're digging through your HubSpot data to find insights...
        </p>

        {/* Progress steps */}
        <div className="mt-8 space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Connecting to your HubSpot account</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-100"></div>
            <span>Analyzing your data for opportunities</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
            <span>Preparing your personalized recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

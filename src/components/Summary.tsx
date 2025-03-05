import React from 'react';

interface SummaryProps {
  bulletPoints: string[];
  paragraph: string;
  loading: boolean;
}

export function Summary({ bulletPoints, paragraph, loading }: SummaryProps) {
  return (
    <div className="mt-6 border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Summary</h3>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-10 h-10 border-4 border-ou-crimson border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Generating summary...</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h4 className="font-medium text-ou-crimson mb-2">Key Points</h4>
            <ul className="list-disc pl-5 space-y-1">
              {bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          
          {paragraph && (
            <div>
              <h4 className="font-medium text-ou-crimson mb-2">Summary</h4>
              <p className="text-gray-700">{paragraph}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
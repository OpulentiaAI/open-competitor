import React from 'react';

export const DefaultArtifactView = ({ data }: { data: any }) => {
  return (
    <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
      {JSON.stringify(data, null, 2).substring(0, 300)}...
    </pre>
  );
};


import React from 'react';

interface ItemCardProps {
  name: string;
  condition: 'Good' | 'Fair' | 'Poor';
  suburb: string;
  description: string;
  onClaim: () => void;
  lat?: number;
  lng?: number;
  isHighlighted?: boolean;
  communityStatus: {
    status: string;
    icon: string;
    time: string;
    color: string;
  };
  isReportPanelOpen: boolean;
  onToggleReportPanel: () => void;
  onReportStatus: (status: string, icon: string, color: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  name, 
  condition, 
  suburb, 
  description, 
  onClaim, 
  lat, 
  lng, 
  isHighlighted,
  communityStatus,
  isReportPanelOpen,
  onToggleReportPanel,
  onReportStatus
}) => {
  const conditionColors = {
    Good: 'bg-green-500',
    Fair: 'bg-yellow-500',
    Poor: 'bg-orange-500',
  };

  const openDirections = () => {
    if (lat !== undefined && lng !== undefined) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border transition-all ${
      isHighlighted ? 'border-furni-green border-l-4' : 'border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <span className={`${conditionColors[condition]} text-white text-xs px-2 py-1 rounded-full`}>
          {condition}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">📍 {suburb}</p>
      <p className="text-gray-700 mb-4">{description}</p>
      
      {/* Community Status Display */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        <p className="text-xs text-gray-600 mb-1">📣 Community Reports:</p>
        <p className={`text-sm font-semibold ${communityStatus.color}`}>
          {communityStatus.icon} {communityStatus.status} — reported {communityStatus.time}
        </p>
      </div>

      {/* Report Status Button */}
      <button
        onClick={onToggleReportPanel}
        className="w-full mb-2 py-1.5 px-3 text-sm bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors"
      >
        📋 Report Status
      </button>

      {/* Inline Report Panel */}
      {isReportPanelOpen && (
        <div className="mb-3 p-3 bg-white border-2 border-furni-green rounded-lg">
          <p className="text-sm font-semibold mb-2 text-center text-gray-700">What's the status?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onReportStatus('Still there', '✅', 'text-green-600')}
              className="py-2 px-3 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
            >
              ✅ Still there
            </button>
            <button
              onClick={() => onReportStatus('Just picked up', '🚚', 'text-blue-600')}
              className="py-2 px-3 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              🚚 Just picked up
            </button>
            <button
              onClick={() => onReportStatus('Looks damaged', '⚠️', 'text-orange-600')}
              className="py-2 px-3 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
            >
              ⚠️ Looks damaged
            </button>
            <button
              onClick={() => onReportStatus('Already gone', '❌', 'text-red-600')}
              className="py-2 px-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
            >
              ❌ Already gone
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onClaim}
        className="w-full bg-furni-green text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
      >
        Claim Item
      </button>
      {lat !== undefined && lng !== undefined && (
        <button
          onClick={openDirections}
          className="w-full mt-2 bg-white border-2 border-furni-green text-furni-green py-2 px-4 rounded-md hover:bg-green-50 transition-colors font-medium"
        >
          🧭 Get Directions
        </button>
      )}
    </div>
  );
};

export default ItemCard;

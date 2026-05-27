import React from 'react';

interface ConfirmationProps {
  userRole: 'give' | 'find' | null;
  item: {
    name: string;
    condition?: string;
    suburb: string;
    pickupWindow?: string;
    itemSize?: string;
  };
  claimedItem: {
    name: string;
    suburb: string;
  } | null;
  onStartOver: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({ userRole, item, claimedItem, onStartOver }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* FurniLoop Header */}
      <div className="w-full bg-white border-b-2 border-furni-green py-3 px-4">
        <h2 className="text-xl font-bold text-furni-green text-center">
          FurniLoop
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-6xl text-furni-green mb-6">✓</div>

          {userRole === 'give' && (
            <div>
              <h1 className="text-2xl font-bold text-furni-green mb-4">Item Posted!</h1>
              
              {/* Item Summary Card */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <p className="font-bold text-lg text-gray-900">{item.name}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                  item.condition === 'Good' ? 'bg-green-100 text-green-800' :
                  item.condition === 'Fair' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.condition}
                </span>
                <p className="text-sm text-gray-600 mt-2">📍 {item.suburb}</p>
                {item.pickupWindow && (
                  <p className="text-sm text-gray-600">🕐 {item.pickupWindow}</p>
                )}
              </div>
              
              {/* Dynamic Sustainability Message */}
              <p className="text-furni-green font-semibold mb-2">
                {item.itemSize?.includes('Large') ? 'Estimated landfill saving: ~45kg ♻️' :
                 item.itemSize?.includes('Medium') ? 'Estimated landfill saving: ~25kg ♻️' :
                 'Estimated landfill saving: ~10kg ♻️'}
              </p>
              
              <p className="text-gray-700 mb-6">
                Thank you for keeping communities circular.
              </p>
            </div>
          )}

          {userRole === 'find' && claimedItem && (
            <div>
              <h1 className="text-2xl font-bold text-furni-green mb-4">Item Claimed!</h1>
              <p className="text-gray-700 mb-2">
                <strong>{claimedItem.name}</strong> in {claimedItem.suburb}
              </p>
              <p className="text-furni-green font-semibold mb-6">
                Estimated landfill saving: {
                  claimedItem.name.includes('Sofa') || claimedItem.name.includes('Desk') 
                    ? '~25kg ♻️' 
                    : claimedItem.name.includes('Shelf') || claimedItem.name.includes('Bookshelf')
                    ? '~15kg ♻️'
                    : '~10kg ♻️'
                }
              </p>
            </div>
          )}

          <button
            onClick={onStartOver}
            className="w-full bg-furni-green text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Start Over
          </button>

          {/* Clear My Data Control */}
          <div className="mt-4 text-center">
            <button
              onClick={onStartOver}
              className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
            >
              🗑 Clear my data
            </button>
            <p className="text-xs text-gray-400 mt-1">
              This removes all your session data from the app.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

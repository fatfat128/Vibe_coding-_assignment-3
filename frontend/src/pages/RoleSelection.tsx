import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RoleSelectionProps {
  onSelectRole: (role: 'give' | 'find') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* FurniLoop Header */}
      <div className="w-full bg-white border-b-2 border-furni-green py-3 px-4 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-furni-green hover:text-green-700"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-furni-green text-center">
          FurniLoop
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-furni-green text-center mb-8">
            What would you like to do today?
          </h1>

          <div className="space-y-4">
            <button
              onClick={() => onSelectRole('give')}
              className="w-full bg-white rounded-lg shadow-md p-6 border-2 border-gray-300 hover:border-furni-green hover:shadow-lg transition-all text-left"
            >
              <h2 className="text-2xl font-bold text-furni-green mb-2">🪑 Give Furniture</h2>
              <p className="text-gray-600">Post an item you're leaving out</p>
            </button>

            <button
              onClick={() => onSelectRole('find')}
              className="w-full bg-white rounded-lg shadow-md p-6 border-2 border-gray-300 hover:border-furni-green hover:shadow-lg transition-all text-left"
            >
              <h2 className="text-2xl font-bold text-furni-green mb-2">🔍 Find Furniture</h2>
              <p className="text-gray-600">Browse free items near you</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

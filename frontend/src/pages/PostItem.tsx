import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSection from '../components/FormSection';

interface PostItemProps {
  item: {
    name: string;
    condition: 'Good' | 'Fair' | 'Poor' | '';
    suburb: string;
    pickupWindow: string;
    itemSize: string;
    stillAvailable: string;
    remarks: string;
    photoFile: File | null;
  };
  onItemChange: (field: string, value: string | File | null) => void;
  onSubmit: () => void;
}

const PostItem: React.FC<PostItemProps> = ({ item, onItemChange, onSubmit }) => {
  const navigate = useNavigate();
  const [touched, setTouched] = useState({
    name: false,
    suburb: false,
    condition: false,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const errors = {
    name: !item.name.trim(),
    suburb: !item.suburb.trim(),
    condition: !item.condition,
  };

  const showError = (field: keyof typeof touched) => touched[field] && errors[field];
  const isFormValid = item.name && item.suburb && item.condition && !errors.condition;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onItemChange('photoFile', file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* FurniLoop Header */}
      <div className="w-full bg-white border-b-2 border-furni-green py-3 px-4 relative">
        <button 
          onClick={() => navigate('/role')}
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
            Post Your Item
          </h1>

        <FormSection>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              id="name"
              type="text"
              value={item.name}
              onChange={(e) => onItemChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                showError('name') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Wooden Desk"
            />
            {showError('name') && (
              <p className="text-red-500 text-sm mt-1">Item name is required</p>
            )}
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              id="condition"
              value={item.condition}
              onChange={(e) => onItemChange('condition', e.target.value)}
              onBlur={() => handleBlur('condition')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                showError('condition') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select condition...</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
            {showError('condition') && (
              <p className="text-red-500 text-sm mt-1">Please select a condition</p>
            )}
          </div>

          <div>
            <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1">
              Suburb
            </label>
            <input
              id="suburb"
              type="text"
              value={item.suburb}
              onChange={(e) => onItemChange('suburb', e.target.value)}
              onBlur={() => handleBlur('suburb')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                showError('suburb') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Carlton"
            />
            {showError('suburb') && (
              <p className="text-red-500 text-sm mt-1">Suburb is required</p>
            )}
          </div>

          {/* Pickup Window */}
          <div>
            <label htmlFor="pickupWindow" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Window
            </label>
            <select
              id="pickupWindow"
              value={item.pickupWindow}
              onChange={(e) => onItemChange('pickupWindow', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green"
            >
              <option value="">Select pickup window...</option>
              <option value="Anytime">Anytime</option>
              <option value="Morning (8am–12pm)">Morning (8am–12pm)</option>
              <option value="Afternoon (12pm–5pm)">Afternoon (12pm–5pm)</option>
              <option value="Evening (5pm–8pm)">Evening (5pm–8pm)</option>
              <option value="Weekend only">Weekend only</option>
            </select>
          </div>

          {/* Item Size */}
          <div>
            <label htmlFor="itemSize" className="block text-sm font-medium text-gray-700 mb-1">
              Item Size
            </label>
            <select
              id="itemSize"
              value={item.itemSize}
              onChange={(e) => onItemChange('itemSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green"
            >
              <option value="">Select item size...</option>
              <option value="Small (fits in a car)">Small (fits in a car)</option>
              <option value="Medium (needs a van)">Medium (needs a van)</option>
              <option value="Large (needs a truck)">Large (needs a truck)</option>
            </select>
          </div>

          {/* Still Available */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Still Available?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="stillAvailable"
                  value="Yes"
                  checked={item.stillAvailable === 'Yes'}
                  onChange={(e) => onItemChange('stillAvailable', e.target.value)}
                  className="mr-2 w-4 h-4 text-furni-green focus:ring-furni-green"
                />
                <span className="text-gray-700">Yes, still there</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="stillAvailable"
                  value="No"
                  checked={item.stillAvailable === 'No'}
                  onChange={(e) => onItemChange('stillAvailable', e.target.value)}
                  className="mr-2 w-4 h-4 text-furni-green focus:ring-furni-green"
                />
                <span className="text-gray-700">No, just taken</span>
              </label>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add a Photo (optional)
            </label>
            <label htmlFor="photo" className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-furni-green transition-colors">
                <span className="text-4xl">📷</span>
                <p className="text-gray-600 mt-2">Tap to upload photo</p>
              </div>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="mt-3">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (optional)
            </label>
            <textarea
              id="remarks"
              value={item.remarks}
              onChange={(e) => onItemChange('remarks', e.target.value.slice(0, 200))}
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green resize-none"
              placeholder="Anything else people should know? e.g. 'Left by the green gate', 'Missing one leg but sturdy'"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {item.remarks.length}/200
            </p>
          </div>

          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isFormValid
                ? 'bg-furni-green text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Post Item
          </button>
        </FormSection>
        </div>
      </div>
    </div>
  );
};

export default PostItem;

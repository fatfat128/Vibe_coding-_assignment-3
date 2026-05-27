import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSection from '../components/FormSection';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => void;
  onRegisterWithGoogle: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onRegisterWithGoogle }) => {
  const navigate = useNavigate();
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [triedGoogleWithoutConsent, setTriedGoogleWithoutConsent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const errors = {
    name: formData.name.trim().length < 2,
    email: !formData.email.includes('@') || !formData.email.includes('.'),
    password: formData.password.length < 6,
    confirmPassword: formData.password !== formData.confirmPassword,
  };

  const showError = (field: keyof typeof touched) => touched[field] && errors[field];
  
  const isFormValid = 
    formData.name.trim().length >= 2 &&
    formData.email &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    !errors.name && !errors.email && !errors.password && !errors.confirmPassword &&
    consentGiven;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    onRegister(formData.name, formData.email, formData.password);
  };

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
            Create Account
          </h1>

          <FormSection>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                  showError('name') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {showError('name') && (
                <p className="text-red-500 text-sm mt-1">Name must be at least 2 characters</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                  showError('email') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {showError('email') && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                  showError('password') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Minimum 6 characters"
              />
              {showError('password') && (
                <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                  showError('confirmPassword') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Re-enter your password"
              />
              {showError('confirmPassword') && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Active Consent Checkbox */}
            <div className="flex items-start gap-2 mb-3">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => {
                  setConsentGiven(e.target.checked);
                  if (e.target.checked) {
                    setTriedGoogleWithoutConsent(false);
                  }
                }}
                className="mt-1 w-4 h-4 text-furni-green accent-furni-green border-gray-300 rounded focus:ring-2 focus:ring-furni-green"
              />
              <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                I understand my suburb will be visible to others in the community. My exact location is never shared.
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isFormValid
                  ? 'bg-furni-green text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Account
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign-up Button */}
            <button
              onClick={() => {
                if (!consentGiven) {
                  setTriedGoogleWithoutConsent(true);
                } else {
                  onRegisterWithGoogle();
                }
              }}
              disabled={false}
              className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:shadow-md transition-shadow flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </g>
              </svg>
              Sign up with Google
            </button>
            {triedGoogleWithoutConsent && !consentGiven && (
              <p className="text-red-500 text-xs text-center mt-1">
                Please tick the consent box above first
              </p>
            )}

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-furni-green font-medium hover:text-green-700 underline"
              >
                Log in
              </button>
            </p>
          </FormSection>
        </div>
      </div>
    </div>
  );
};

export default Register;

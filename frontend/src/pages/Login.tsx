import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSection from '../components/FormSection';

interface LoginProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: () => void;
  onGoogleLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ email, password, onEmailChange, onPasswordChange, onLogin, onGoogleLogin }) => {
  const navigate = useNavigate();
  const [touched, setTouched] = useState({ email: false, password: false });
  const [consentGiven, setConsentGiven] = useState(false);
  const [triedGoogleWithoutConsent, setTriedGoogleWithoutConsent] = useState(false);

  const errors = {
    email: !email.includes('@') || !email.includes('.'),
    password: password.length < 6,
  };

  const showError = (field: 'email' | 'password') => touched[field] && errors[field];
  const isFormValid = email && password && !errors.email && !errors.password && consentGiven;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-furni-green mb-2">FurniLoop</h1>
          <p className="text-gray-600">Connecting communities, reducing waste</p>
        </div>

        <FormSection>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
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
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green ${
                showError('password') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Minimum 6 characters"
            />
            {showError('password') && (
              <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
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
                setTriedGoogleWithoutConsent(false);
              }}
              className="mt-1 w-4 h-4 text-furni-green accent-furni-green border-gray-300 rounded focus:ring-2 focus:ring-furni-green"
            />
            <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
              I understand my suburb will be visible to others in the community. My exact location is never shared.
            </label>
          </div>

          <button
            onClick={onLogin}
            disabled={!isFormValid}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isFormValid
                ? 'bg-furni-green text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Login
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

          {/* Google Login Button */}
          <button
            onClick={() => {
              if (!consentGiven) {
                setTriedGoogleWithoutConsent(true);
              } else {
                onGoogleLogin();
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
            Continue with Google
          </button>
          {triedGoogleWithoutConsent && !consentGiven && (
            <p className="text-red-500 text-xs text-center mt-1">
              Please tick the consent box above first
            </p>
          )}

          <p className="text-center text-sm text-gray-600 mt-4">
            New here?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-furni-green font-medium hover:text-green-700 underline"
            >
              Create an account
            </button>
          </p>
        </FormSection>
      </div>
    </div>
  );
};

export default Login;

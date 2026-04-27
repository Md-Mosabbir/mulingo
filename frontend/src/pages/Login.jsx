import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const Login = ({ onLoginSuccess }) => {
  const handleSuccess = (credentialResponse) => {
    console.log('Login Success:', credentialResponse);
    onLoginSuccess(credentialResponse);
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1120] text-white p-4">
      {/* Dynamic Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-[#161B22]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Mulingo
          </h1>
          <p className="mt-3 text-gray-400 text-center font-medium">
            Bridging languages, one message at a time.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="px-2 bg-[#161B22] text-gray-500 tracking-widest font-semibold">Get Started</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to Mulingo's <span className="text-blue-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm font-medium">
        &copy; 2026 Mulingo. Premium AI Real Estate.
      </div>
    </div>
  );
};

export default Login;

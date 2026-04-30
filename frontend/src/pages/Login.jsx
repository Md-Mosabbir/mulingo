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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1120] text-white p-4 relative">
      {/* Dynamic Background Effect (Moved here to ensure proper z-index flow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8 py-10 bg-[#161B22]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl flex flex-col justify-start gap-12 ">

        <div className="flex flex-col items-center justify-start flex-grow-0 pt-2">

          <h1 className="font-pacifico text-5xl text-white py-2">
            Mulingo
          </h1>
          <p className="mt-3 text-gray-400 text-center font-medium">
            Bridging languages, one message at a time.
          </p>
        </div>

        <div className="space-y-6 flex-grow">
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

        <div className="mt-auto text-center pt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to Mulingo's <span className="text-blue-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
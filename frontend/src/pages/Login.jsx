import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

export default function Login({ onLoginSuccess }) {
  const handleSuccess = (credentialResponse) => {
    onLoginSuccess(credentialResponse);
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1120] text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [1.05, 1, 1.05] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md px-8 py-10 bg-[#161B22]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl flex flex-col justify-start gap-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center justify-start flex-grow-0 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <motion.h1
            className="font-pacifico text-5xl text-white py-2"
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            Mulingo
          </motion.h1>
          <p className="mt-3 text-gray-400 text-center font-medium">Bridging languages, one message at a time.</p>
        </motion.div>

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
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
              />
            </motion.div>
          </div>
        </div>

        <div className="mt-auto text-center pt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to Mulingo's{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Terms of Service</span> and{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

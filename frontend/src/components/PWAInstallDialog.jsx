import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share, PlusSquare, Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function PWAInstallDialog({ 
  isInstallable, 
  installApp, 
  notificationPermission, 
  requestNotificationPermission 
}) {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Show dialog if not installed and (installable or is iOS)
    // We wait a bit to not annoy the user immediately
    const timer = setTimeout(() => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (!isInstalled) {
        setShow(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = () => {
    installApp();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:bottom-6 md:w-96"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#374151] bg-[#111926]/90 backdrop-blur-xl p-5 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7b61ff]/20 blur-3xl" />
            
            <button
              onClick={() => setShow(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7b61ff]/10 text-[#7b61ff]">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Get the Web App</h3>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Install Mulingo on your home screen for a better experience and real-time notifications.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {isInstallable ? (
                <button
                  onClick={handleInstall}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b61ff] py-2.5 text-sm font-semibold text-white hover:bg-[#6b52e0] transition-all active:scale-[0.98]"
                >
                  <PlusSquare className="h-4 w-4" />
                  Install Mulingo
                </button>
              ) : isIOS ? (
                <div className="rounded-xl bg-[#1F2937] p-3 text-xs text-[#D1D5DB]">
                  <p className="font-medium text-white mb-2">To install on iOS:</p>
                  <ol className="list-decimal space-y-1.5 pl-4">
                    <li>Tap the <Share className="inline h-3.5 w-3.5 mx-0.5 text-[#7b61ff]" /> button in the browser</li>
                    <li>Scroll down and tap <span className="font-semibold text-white">"Add to Home Screen"</span></li>
                  </ol>
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] italic">
                  Open this page in Chrome or Safari to install the web app.
                </p>
              )}

              {notificationPermission === 'default' && (
                <button
                  onClick={() => {
                    requestNotificationPermission();
                    setShow(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#374151] bg-[#1F2937] py-2 text-sm font-medium text-[#E5E7EB] hover:bg-[#374151] transition-all"
                >
                  <Bell className="h-4 w-4" />
                  Enable Notifications
                </button>
              )}
            </div>
            
            {/* Tag/Badge for "get web app stuff" */}
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center rounded-full bg-[#7b61ff]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#7b61ff] uppercase tracking-wider">
                get web app stuff
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

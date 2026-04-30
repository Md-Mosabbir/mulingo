import { LogOut } from "lucide-react";

function TopOptionBar({ user, onLogout }) {
  return (
    <header className="flex items-center justify-between py-2 px-1 bg-[#111827] ">
      <p className="font-pacifico px-4 md:px-10 text-[24px] md:text-[32px] text-white">Mulingo</p>



      <div className="flex items-center gap-3 pr-2">
        {user && (
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <span className="text-sm font-medium text-gray-300">{user.username}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10">
              {user.picture ? (
                <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          type="button"
          className="flex h-10 px-4 items-center justify-center gap-2 rounded-full border border-[#3a2f70] bg-[#1D153D] text-[#FCA5A5] hover:bg-red-500/10 transition-colors text-sm font-medium"
          aria-label="Logout"
        >
          <LogOut size={15} strokeWidth={2.2} />
          Logout
        </button>
      </div>
    </header>
  );
}


export default TopOptionBar;

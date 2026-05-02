import { Link } from "react-router-dom";
import { BarChart3, LogOut, PlusCircle, UserRound } from "lucide-react";

export default function TopOptionBar({ user, onLogout, onOpenProfile, onOpenCreateGroup }) {
  return (
    <header className="flex items-center justify-between py-2 px-1 bg-[#111827] border-b border-[#1F2937]">
      <Link to="/" className="font-pacifico px-4 md:px-10 text-[24px] md:text-[32px] text-white hover:text-[#e9d5ff] transition-colors">
        Mulingo
      </Link>

      <div className="flex items-center gap-1 sm:gap-2 pr-2">
        <button
          type="button"
          onClick={onOpenCreateGroup}
          className="flex items-center gap-1.5 rounded-full border border-[#374151] bg-[#1F2937] px-3 py-2 text-xs font-semibold text-white hover:bg-[#374151] transition-colors"
          title="New group"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">New group</span>
        </button>

        <Link
          to="/reports"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#374151] bg-[#1F2937] text-[#E5E7EB] hover:bg-[#374151] transition-colors sm:w-auto sm:px-3 sm:gap-2"
          title="SQL report demos"
        >
          <BarChart3 size={18} />
          <span className="hidden sm:inline text-xs font-semibold">Reports</span>
        </Link>

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#374151] bg-[#1F2937] text-[#E5E7EB] hover:bg-[#374151] transition-colors"
          title="Edit profile"
        >
          <UserRound size={18} />
        </button>

        {user && (
          <div className="hidden md:flex items-center gap-2 mr-1">
            <span className="text-sm font-medium text-gray-300 max-w-[120px] truncate">{user.username}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10 shrink-0">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-full h-full object-cover" />
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
          className="flex h-10 px-3 sm:px-4 items-center justify-center gap-2 rounded-full border border-[#3a2f70] bg-[#1D153D] text-[#FCA5A5] hover:bg-red-500/10 transition-colors text-sm font-medium"
          aria-label="Logout"
        >
          <LogOut size={15} strokeWidth={2.2} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

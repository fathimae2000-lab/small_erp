import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Mail, Shield, Key, Save, CheckCircle } from "lucide-react";

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);


  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      
      
      setIsSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setIsSaved(false), 3000); 
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "UN";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Account</p>
        <h1 className="text-lg font-semibold text-slate-800">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2.2fr]">
        
        {/* Left Side: User Summary Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-shadow duration-200 hover:shadow-lg">
          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4FD5F0] to-[#2B54D6] text-2xl font-bold text-white shadow-md">
            {getInitials(user?.name)}
          </div>
          <h2 className="text-base font-semibold text-slate-800">{user?.name || "User Name"}</h2>
          <p className="text-xs text-slate-400 mb-4">{user?.email || "user@email.com"}</p>
          
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
            <Shield size={14} className="text-[#2B54D6]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role: {user?.role || "Staff"}
            </span>
          </div>
        </div>

        {/* Right Side: Profile Details & Password Form */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2B54D6] opacity-[0.04] blur-3xl" />
          
          <h3 className="mb-4 text-sm font-semibold text-slate-800 border-b border-slate-50 pb-2">Account Settings</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Success Alert */}
            {isSaved && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600 border border-emerald-100 animate-fadeIn">
                <CheckCircle size={16} />
                <span>Profile settings updated successfully!</span>
              </div>
            )}

            {/* Input fields grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Full Name</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#2B54D6]/40 focus-within:bg-white">
                  <User size={15} className="text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Email Address</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#2B54D6]/40 focus-within:bg-white">
                  <Mail size={15} className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <h3 className="mt-2 mb-1 text-sm font-semibold text-slate-800 border-b border-slate-50 pb-2">Change Password</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Current Password</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#2B54D6]/40 focus-within:bg-white">
                  <Key size={15} className="text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">New Password</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#2B54D6]/40 focus-within:bg-white">
                  <Key size={15} className="text-slate-400" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                <Save size={15} />
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
export default function NavItem({ name, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
        active
          ? "bg-white/15 font-semibold text-white shadow-sm shadow-black/10 translate-x-1"
          : "text-indigo-100/70 hover:bg-white/10 hover:text-white hover:translate-x-0.5"
      }`}
    >
      {/* Active Indicator Line - Updated gradient direction */}
      {active && (
        <span className="absolute left-0 h-5 w-1 rounded-r-full bg-gradient-to-r from-[#4FD5F0] to-[#2B54D6]" />
      )}
      
      {/* Icon Styling with premium active color */}
      <Icon
        size={18}
        strokeWidth={active ? 2.5 : 2}
        className={`transition-colors duration-200 ${
          active 
            ? "text-[#4FD5F0] drop-shadow-[0_0_6px_rgba(79,213,240,0.5)]" 
            : "text-indigo-200/60 group-hover:text-[#4FD5F0]"
        }`}
      />
      
      <span className="tracking-wide">{name}</span>
    </button>
  );
}
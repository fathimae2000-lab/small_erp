import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../redux/slices/authSlice";
import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Briefcase } from "lucide-react";
import { toast } from "react-toastify";

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error: serverError, token, user } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
  });

  const lastErrorRef = useRef(null);

  useEffect(() => {
  const localToken = localStorage.getItem("token");
  const localUser = localStorage.getItem("user");
  
  const hasValidLocalToken = localToken && localToken !== "undefined" && localToken !== "null";

  if (token || user || hasValidLocalToken || localUser) {
    navigate("/dashboard", { replace: true });
  }
}, [token, user, navigate]);

  useEffect(() => {
    if (serverError && serverError !== lastErrorRef.current) {
      lastErrorRef.current = serverError;
      setErrors({ form: serverError });
      toast.error(serverError || "Something went wrong. Please try again.");
    }
  }, [serverError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.password) tempErrors.password = "Password is required";

    if (!isLogin) {
      if (!formData.name) tempErrors.name = "Full Name is required";
      if (!formData.phone) tempErrors.phone = "Phone Number is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isLogin) {
      const result = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Login successful!");
        // navigation is handled by the useEffect watching token/user
      } else {
        // result.payload should hold the rejected value from your thunk's rejectWithValue
        const message =
          typeof result.payload === "string"
            ? result.payload
            : result.payload?.message || result.error?.message || "Invalid email or password";
        toast.error(message);
      }
    } else {
      try {
        const result = await dispatch(signupUser(formData));
        if (result.meta.requestStatus === "fulfilled") {
          setIsLogin(true);
          setErrors({});
          toast.success("Account created successfully! Please log in.");
        } else {
          const message =
            typeof result.payload === "string"
              ? result.payload
              : result.payload?.message || result.error?.message || "Signup failed";
          toast.error(message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong during signup.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-4 text-slate-900">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2B54D6]/5 blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">

        {/* Logo & Header */}
        <div className="mb-6 flex flex-col items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4FD5F0] to-[#2B54D6] text-lg font-bold text-white shadow-md">
            E
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#131E4D] to-[#2B54D6] bg-clip-text text-transparent">
            Ergonest ERP
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin ? "Welcome back! Please login to your account." : "Create an account to get started."}
          </p>
        </div>

        {/* Global Form Error (Invalid credentials) */}
        {errors.form && (
          <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-100">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>

          {/* Name Field (Signup only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Full Name</label>
              <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.name ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
                <User size={16} className={errors.name ? 'text-rose-400' : 'text-slate-400'} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.name}</p>}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Email Address</label>
            <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.email ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <Mail size={16} className={errors.email ? 'text-rose-400' : 'text-slate-400'} />
              <input
                type="email"
                name="email"
                placeholder="admin@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.email}</p>}
          </div>

          {/* Phone Field (Signup only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Phone Number</label>
              <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.phone ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
                <Phone size={16} className={errors.phone ? 'text-rose-400' : 'text-slate-400'} />
                <input
                  type="text"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.phone}</p>}
            </div>
          )}

          {/* Role Field (Signup only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">System Role</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition-colors focus-within:border-[#2B54D6]/40">
                <Briefcase size={16} className="text-slate-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Password</label>
            <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.password ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <Lock size={16} className={errors.password ? 'text-rose-400' : 'text-slate-400'} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] py-2.5 mt-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Option */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="font-semibold text-[#2B54D6] hover:underline"
          >
            {isLogin ? "Sign up here" : "Login here"}
          </button>
        </div>

      </div>
    </div>
  );
}
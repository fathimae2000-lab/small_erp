import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, User, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { addCustomer, updateCustomer } from "../redux/slices/customerSlice";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function AddCustomerModal({ isOpen, onClose, customer = null }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.customers);
  const isEditMode = Boolean(customer);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          name: customer.name ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Customer name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) tempErrors.phone = "Phone number is required";
    if (!formData.address.trim()) tempErrors.address = "Address is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = isEditMode
        ? await dispatch(updateCustomer({ id: customer._id, customerData: formData }))
        : await dispatch(addCustomer(formData));

      if (result.meta.requestStatus === "fulfilled") {
        toast.success(
          isEditMode ? "Customer updated successfully! ✏️" : "Customer added successfully! 👥",
          { position: "top-right", autoClose: 3000, theme: "colored" }
        );
        setFormData(emptyForm);
        onClose(true);
      } else {
        toast.error(
          result.payload || `Failed to ${isEditMode ? "update" : "add"} customer. Please try again.`
        );
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B54D6]/10 text-[#2B54D6]">
              <User size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditMode ? "Edit Customer" : "Add New Customer"}
            </h3>
          </div>
          <button onClick={handleCancel} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Customer Name</label>
            <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.name ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <User size={16} className="text-slate-400" />
              <input
                type="text"
                name="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.name}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Email Address</label>
              <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.email ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Phone Number</label>
              <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.phone ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
                <Phone size={16} className="text-slate-400" />
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
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Address</label>
            <div className={`flex gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.address ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <MapPin size={16} className="text-slate-400 mt-0.5" />
              <textarea
                name="address"
                rows="3"
                placeholder="Enter full address..."
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300 resize-none"
              />
            </div>
            {errors.address && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.address}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#2B54D6] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#1f3fa3] disabled:opacity-50"
            >
              {loading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Customer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
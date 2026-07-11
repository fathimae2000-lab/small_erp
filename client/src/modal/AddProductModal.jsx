import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Package, DollarSign, Layers, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { addProduct, updateProduct } from "../redux/slices/ProductSlice";

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  category: "Electronics",
  description: "",
};

export default function AddProductModal({ isOpen, onClose, product = null }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.products);
  const isEditMode = Boolean(product);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name ?? "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          category: product.category ?? "Electronics",
          description: product.description ?? "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0) tempErrors.price = "Enter a valid price";
    if (!formData.stock || formData.stock < 0) tempErrors.stock = "Enter a valid stock count";
    if (!formData.description.trim()) tempErrors.description = "Description is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = isEditMode
      ? await dispatch(updateProduct({ id: product._id, productData: formData }))
      : await dispatch(addProduct(formData));

    if (result.meta.requestStatus === "fulfilled") {
      setFormData(emptyForm);
      onClose(true, isEditMode);
    } else {
      const message =
        typeof result.payload === "string"
          ? result.payload
          : `Failed to ${isEditMode ? "update" : "add"} product`;
      toast.error(message);
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
              <Package size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h3>
          </div>
          <button onClick={handleCancel} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Product Name</label>
            <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.name ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <Package size={16} className="text-slate-400" />
              <input
                type="text"
                name="name"
                placeholder="e.g., Wireless Mouse"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.name}</p>}
          </div>

          {/* Price & Stock (Two Columns in One Row) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Price ($)</label>
              <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.price ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
                <DollarSign size={16} className="text-slate-400" />
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
              {errors.price && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Stock Quantity</label>
              <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.stock ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
                <Layers size={16} className="text-slate-400" />
                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
              {errors.stock && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Category</label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-[#2B54D6]/40">
              <Layers size={16} className="text-slate-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Gadgets</option>
                <option value="Furniture">Accessories</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Description</label>
            <div className={`flex gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.description ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <FileText size={16} className="text-slate-400 mt-0.5" />
              <textarea
                name="description"
                rows="3"
                placeholder="Enter product details..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300 resize-none"
              />
            </div>
            {errors.description && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.description}</p>}
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
              {loading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
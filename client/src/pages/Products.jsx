import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package, AlertTriangle, Ban, Tags, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { toast } from "react-toastify";

import AddProductModal from "../modal/AddProductModal";
import { fetchProducts, deleteProduct } from "../redux/slices/ProductSlice";
import DeleteConfirmModal from "../modal/DeleteConfirmationModal";

const badgeClasses = {
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  success: "bg-emerald-50 text-emerald-600",
};

function getStockLevel(stock) {
  if (stock === 0) return "danger";
  if (stock <= 10) return "warning";
  return "success";
}

function StatCard({ label, value, icon: Icon, from, to, blob }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_16px_32px_-10px_rgba(30,41,90,0.28)]">
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-[0.10] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: blob }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <Icon size={17} />
        </div>
      </div>
      <p className="relative mt-3 text-[13px] text-slate-500">{label}</p>
      <p
        className="relative bg-clip-text text-[26px] font-semibold leading-tight text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${from}, ${to})` }}
      >
        {value}
      </p>
    </div>
  );
}

export default function Products() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [stockFilter, setStockFilter] = useState("All stock");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, stockFilter]);

  // derive stats from real data
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const categories = new Set(products.map((p) => p.category)).size;

  const STATS = [
    { label: "Total products", value: String(totalProducts), icon: Package, from: "#2B54D6", to: "#4FD5F0", blob: "#2B54D6" },
    { label: "Low stock", value: String(lowStock), icon: AlertTriangle, from: "#B7791F", to: "#F0B84F", blob: "#B7791F" },
    { label: "Out of stock", value: String(outOfStock), icon: Ban, from: "#C0392B", to: "#F0836B", blob: "#C0392B" },
    { label: "Categories", value: String(categories), icon: Tags, from: "#5B3FE0", to: "#8B7BFF", blob: "#5B3FE0" },
  ];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All categories" || p.category === category;
    const matchesStock =
      stockFilter === "All stock" ||
      (stockFilter === "In stock" && p.stock > 10) ||
      (stockFilter === "Low stock" && p.stock > 0 && p.stock <= 10) ||
      (stockFilter === "Out of stock" && p.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = (wasSuccessful, wasEdit) => {
    setModalOpen(false);
    if (wasSuccessful === true) {
      toast.success(
        wasEdit ? "Product updated successfully! ✏️" : "Product added successfully! 🎉",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    }
    setEditingProduct(null);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await dispatch(deleteProduct(productToDelete._id)).unwrap(); 
      toast.error("Product deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.warning(err || "Failed to delete product");
    } finally {
      // Close modal and reset state
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors focus-within:border-[#2B54D6]/40">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
          >
            <option>All categories</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Stationery</option>
            <option>Clothing</option>
            <option>Accessories</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
          >
            <option>All stock</option>
            <option>In stock</option>
            <option>Low stock</option>
            <option>Out of stock</option>
          </select>
          <button
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add product
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F9FE] text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-[8%] px-3 py-3 font-medium">Image</th>
                <th className="w-[26%] px-3 py-3 font-medium">Name</th>
                <th className="w-[16%] px-3 py-3 font-medium">Category</th>
                <th className="w-[12%] px-3 py-3 text-right font-medium">Price</th>
                <th className="w-[10%] px-3 py-3 text-right font-medium">Stock</th>
                <th className="w-[12%] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p, i) => {
                  const level = getStockLevel(p.stock);
                  return (
                    <tr
                      key={p._id || p.sku || i}
                      className={`group transition-colors duration-150 hover:bg-[#F7F9FE] ${
                        i > 0 ? "border-t border-slate-50" : ""
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#2B54D6]/10 to-[#4FD5F0]/10 flex items-center justify-center text-[#2B54D6]">
                          <Package size={15} />
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] text-slate-600">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-slate-700">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badgeClasses[level]}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(p)} 
                            className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-around text-sm text-slate-500">
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .slice(0, 7)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "rounded-md bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-3 py-1.5 font-medium text-white shadow-sm"
                      : "rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6]"
                  }
                >
                  {page}
                </button>
              ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />
      <DeleteConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name || ""}
      />
    </>
  );
}
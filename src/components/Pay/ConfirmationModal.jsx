// ConfirmationModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isError = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div
              className={`p-6 ${
                isError
                  ? "bg-gradient-to-r from-red-500 to-rose-600"
                  : "bg-gradient-to-r from-amber-500 to-yellow-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white vintage-heading">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-stone-600 vintage-serif text-lg leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="bg-stone-50 p-6 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded-xl transition-colors vintage-serif"
              >
                {cancelText}
              </motion.button>

              {!isError && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-xl transition-all shadow-lg vintage-serif"
                >
                  {confirmText}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;

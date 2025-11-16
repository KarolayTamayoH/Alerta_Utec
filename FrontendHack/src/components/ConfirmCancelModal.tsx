import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  incidentTitle: string;
}

export default function ConfirmCancelModal({ isOpen, onClose, onConfirm, incidentTitle }: ConfirmCancelModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Cancelar Incidente</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-slate-700 mb-3 leading-relaxed">
                  ¿Estás seguro de que deseas <span className="font-bold text-red-600">cancelar</span> este incidente?
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-600 mb-1 font-medium">Incidente:</p>
                  <p className="text-slate-900 font-semibold">{incidentTitle}</p>
                </div>
                <p className="text-sm text-slate-500">
                  Esta acción marcará el incidente como cancelado y no podrá ser revertida fácilmente.
                </p>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  No, mantener
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                >
                  Sí, cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

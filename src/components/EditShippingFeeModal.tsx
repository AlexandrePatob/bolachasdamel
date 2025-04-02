import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/types/database';
import toast from 'react-hot-toast';

interface EditShippingFeeModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onShippingFeeUpdated: (updatedOrder: Order) => void;
}

export default function EditShippingFeeModal({ 
  order, 
  isOpen, 
  onClose,
  onShippingFeeUpdated 
}: EditShippingFeeModalProps) {
  const [shippingFee, setShippingFee] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setShippingFee(order.shipping_fee || 0);
    }
  }, [order]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/shipping-fee`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shipping_fee: shippingFee }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar valor do frete');
      }

      const updatedOrder = await response.json();
      onShippingFeeUpdated(updatedOrder);
      toast.success('Valor do frete atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error updating shipping fee:', error);
      toast.error('Erro ao atualizar valor do frete');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-pink-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#6b4c3b]">
                    Editar Valor do Frete
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor do Frete
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$ </span>{' '}
                    </div>
                    <input
                      type="number"
                      id="shippingFee"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      step="0.01"
                      min="0"
                      className="block w-full pl-9 pr-12 py-2 border border-pink-200 rounded-md focus:ring-[#6b4c3b] focus:border-[#6b4c3b] sm:text-sm"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">BRL</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Digite o valor do frete em reais
                  </p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6b4c3b]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6b4c3b] border border-transparent rounded-md hover:bg-[#5a3d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6b4c3b] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
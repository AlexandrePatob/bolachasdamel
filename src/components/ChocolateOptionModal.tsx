import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ChocolateOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hasChocolate: boolean) => void;
  product: {
    name: string;
    image: string;
  };
}

export default function ChocolateOptionModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: ChocolateOptionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-pink-600">
                  Escolha a opção de chocolate
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="relative w-full aspect-[4/3] mb-6 rounded-lg overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border border-pink-200 rounded-lg hover:bg-pink-50 cursor-pointer"
                     onClick={() => onConfirm(true)}>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    🍫
                  </div>
                  <div>
                    <h4 className="font-medium text-pink-600">Com chocolate</h4>
                    <p className="text-sm text-gray-600">Adicionar chocolate ao produto</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border border-pink-200 rounded-lg hover:bg-pink-50 cursor-pointer"
                     onClick={() => onConfirm(false)}>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    🍪
                  </div>
                  <div>
                    <h4 className="font-medium text-pink-600">Sem chocolate</h4>
                    <p className="text-sm text-gray-600">Manter o produto original</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
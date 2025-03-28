'use client';
import React, { useState, FormEvent } from 'react';

interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  items: string;
  observations: string;
}

interface OrderFormProps {
  onClose: () => void;
}

const OrderForm = ({ onClose }: OrderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    phone: '',
    address: '',
    items: '',
    observations: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Formatar a mensagem para o WhatsApp
    const message = `
*Novo Pedido - Bolachas da Mel - Páscoa 2025*
Nome: ${formData.name}
Telefone: ${formData.phone}
Endereço: ${formData.address}
Itens: ${formData.items}
Observações: ${formData.observations}
    `.trim();

    // Criar o link do WhatsApp
    const whatsappNumber = "554198038007";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir o WhatsApp em uma nova aba
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-[#6b4c3b] font-medium mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
            placeholder="Digite seu nome completo"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-[#6b4c3b] font-medium mb-2">
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
            placeholder="(XX) XXXXX-XXXX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-[#6b4c3b] font-medium mb-2">
          Endereço de Entrega
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
          placeholder="Rua, número, bairro, cidade e estado"
        />
      </div>

      <div>
        <label htmlFor="items" className="block text-[#6b4c3b] font-medium mb-2">
          Itens do Pedido
        </label>
        <textarea
          id="items"
          name="items"
          value={formData.items}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 h-32 resize-none"
          placeholder="Liste os produtos que deseja pedir..."
        />
      </div>

      <div>
        <label htmlFor="observations" className="block text-[#6b4c3b] font-medium mb-2">
          Observações
        </label>
        <textarea
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 h-32 resize-none"
          placeholder="Alguma observação especial? (opcional)"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-lg text-[#6b4c3b] hover:bg-[#fff0f6] transition-colors duration-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-[#6b4c3b] text-white px-6 py-3 rounded-lg hover:bg-[#5a3d2e] transition-colors duration-300 flex items-center space-x-2"
        >
          <span>Enviar Pedido</span>
          <span>💬</span>
        </button>
      </div>
    </form>
  );
};

export default OrderForm; 
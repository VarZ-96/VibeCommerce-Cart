import React from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    // Add smooth transitions
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300">
      
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price.toFixed(2)}</p>
      <button
        onClick={() => addToCart(product.id, 1)}
        className="mt-3 w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
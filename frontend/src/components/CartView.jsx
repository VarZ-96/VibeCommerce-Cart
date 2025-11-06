import React from 'react';
import { useCart } from '../context/CartContext';

const CartView = ({ onCheckoutClick }) => {
  const { cart, loading, removeFromCart } = useCart();

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between items-center mb-2 p-2 border-b">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x ${item.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="text-right mt-4">
            <h3 className="text-xl font-bold">Total: ${cart.total}</h3>
            <button
              onClick={onCheckoutClick}
              className="mt-3 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartView;
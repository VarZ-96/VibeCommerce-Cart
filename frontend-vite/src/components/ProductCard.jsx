import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProductCard.module.css';
import { useCart } from '../context/CartContext'; // <-- 1. Import useCart

const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // <-- 2. Get the addToCart function
  const { id, name, price, image_url, stock } = product;

  // Animation variants for Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleAddToCart = () => {
    // 3. Call the context function
    addToCart(id, 1); 
  };

  return (
    <motion.div 
      className={styles.card}
      variants={cardVariants}
    >
      <img src={image_url} alt={name} className={styles.image} />
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.price}>₹{parseFloat(price).toFixed(2)}</p>
        {stock > 10 && (
          <p className={styles.stockAvailable}>In Stock</p>
        )}
        {stock <= 10 && stock > 0 && (
          <p className={styles.stockLow}>Only {stock} left!</p>
        )}
        
        {stock === 0 && (
          <p className={styles.stockOut}>Out of Stock</p>
        )}

        <button 
          className={styles.button} 
          onClick={handleAddToCart}
          disabled={stock === 0}
        >
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
import { motion } from 'framer-motion';

export function Background() {
  return (
    <div className="bg-effects" aria-hidden="true">
      <motion.div
        className="orb orb--1"
        animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb orb--2"
        animate={{ x: [0, -25, 0], y: [0, 35, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb orb--3"
        animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="grid-overlay" />
    </div>
  );
}

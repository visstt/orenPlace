import { motion } from 'framer-motion';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p>
        © {year} OrenPlace · Куда сходить в Оренбурге
      </p>
    </motion.footer>
  );
}

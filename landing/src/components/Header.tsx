import { motion, useScroll, useTransform } from 'framer-motion';
import { fadeIn } from '../motion';

export function Header() {
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 80], ['rgba(244, 241, 255, 0)', 'rgba(244, 241, 255, 0.92)']);
  const headerShadow = useTransform(scrollY, [0, 80], ['0 0 0 transparent', '0 8px 32px rgba(78, 0, 224, 0.08)']);

  return (
    <motion.header
      className="header"
      style={{ backgroundColor: headerBg, boxShadow: headerShadow }}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="header__inner">
        <motion.a
          className="logo"
          href="/"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Oren<span>Place</span>
        </motion.a>
        <motion.a
          className="btn btn--small"
          href="#download"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          Скачать
        </motion.a>
      </div>
    </motion.header>
  );
}

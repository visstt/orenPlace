import { motion } from 'framer-motion';
import { IconDownload } from '../icons';
import { scaleIn } from '../motion';

export function Cta() {
  return (
    <motion.section
      className="cta"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={scaleIn}
    >
      <motion.div
        className="cta__glow"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Готовы открыть афишу?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Установите приложение и узнайте, куда сходить уже сегодня.
      </motion.p>
      <motion.a
        className="btn btn--primary btn--on-dark"
        href="/downloads/orenplace.apk"
        download="orenplace.apk"
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <IconDownload className="btn__icon" />
        Скачать приложение
      </motion.a>
    </motion.section>
  );
}

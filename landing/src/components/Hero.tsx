import { motion } from 'framer-motion';
import { IconDownload } from '../icons';
import { fadeUp, staggerContainer } from '../motion';
import { PhoneMock } from './PhoneMock';

export function Hero() {
  return (
    <section className="hero">
      <motion.div
        className="hero__content"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero__badge" variants={fadeUp} custom={0}>
          Оренбург · Афиша и билеты
        </motion.div>

        <motion.h1 variants={fadeUp} custom={1}>
          Куда сходить
          <br />
          в <span className="gradient-text">Оренбурге</span>
        </motion.h1>

        <motion.p className="hero__lead" variants={fadeUp} custom={2}>
          Концерты, театр, выставки и городские события — в одном приложении.
          Сохраняйте избранное, покупайте билеты и не пропускайте то, что вам
          интересно.
        </motion.p>

        <motion.div className="hero__actions" id="download" variants={fadeUp} custom={3}>
          <motion.a
            className="btn btn--primary btn--glow"
            href="/downloads/orenplace.apk"
            download="orenplace.apk"
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconDownload className="btn__icon" />
            Скачать APK для Android
          </motion.a>
          <motion.p className="hero__hint" variants={fadeUp} custom={4}>
            Версия 1.0 · Бесплатно · Android 8+
          </motion.p>
        </motion.div>

        <motion.div className="hero__stats" variants={fadeUp} custom={5}>
          {[
            { value: '8+', label: 'категорий' },
            { value: '24/7', label: 'афиша онлайн' },
            { value: '1 тап', label: 'в избранное' },
          ].map((stat) => (
            <div key={stat.label} className="stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <PhoneMock />
    </section>
  );
}

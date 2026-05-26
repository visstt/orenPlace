import { motion } from 'framer-motion';
import { IconCalendar, IconStar, IconTicket, IconUser } from '../icons';
import { fadeUp, staggerContainer } from '../motion';

const features = [
  {
    icon: IconCalendar,
    title: 'Афиша города',
    text: 'Лента событий с фильтрами по категориям и поиском по названию.',
  },
  {
    icon: IconStar,
    title: 'Избранное',
    text: 'Сохраняйте интересные мероприятия и возвращайтесь к ним в один тап.',
  },
  {
    icon: IconTicket,
    title: 'Билеты',
    text: 'Покупка билетов и раздел «Мои события» — сегодня и предстоящие.',
  },
  {
    icon: IconUser,
    title: 'Профиль',
    text: 'Регистрация, вход и персональные настройки аккаунта.',
  },
];

export function Features() {
  return (
    <section className="features">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        Что внутри
      </motion.h2>

      <motion.div
        className="features__grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {features.map((feature, i) => (
          <motion.article
            key={feature.title}
            className="feature"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
          >
            <motion.div
              className="feature__icon"
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
              transition={{ duration: 0.45 }}
            >
              <feature.icon className="feature__svg" />
            </motion.div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

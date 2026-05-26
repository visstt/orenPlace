import { motion } from 'framer-motion';

const cards = [
  { id: 1, className: 'mock-card mock-card--hero', delay: 0.3 },
  { id: 2, className: 'mock-card', delay: 0.45 },
  { id: 3, className: 'mock-card mock-card--accent', delay: 0.6 },
];

export function PhoneMock() {
  return (
    <motion.div
      className="phone-mock"
      initial={{ opacity: 0, x: 60, rotate: 8 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="phone-mock__frame"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="phone-mock__screen">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className={card.className}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: card.delay }}
            >
              {card.id === 1 && (
                <div className="mock-card__content">
                  <span className="mock-tag">Концерт</span>
                  <span className="mock-title">Джаз в парке</span>
                </div>
              )}
              {card.id === 3 && <div className="mock-pill">Билет куплен</div>}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

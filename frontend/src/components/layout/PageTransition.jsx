import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.985 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{ opacity: 0, y: -20, scale: 0.99, transition: { duration: 0.22, ease: 'easeIn' } }}
      transition={{ duration: 0.58, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

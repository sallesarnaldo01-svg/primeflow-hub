import { motion } from 'framer-motion';
import logo from '@/assets/logo.svg';

export function LoadingSplash() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.img
          src={logo}
          alt="PrimeZapAI"
          className="h-20 w-20 mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            PrimeZapAI
          </h1>
          <p className="text-muted-foreground text-sm">
            Carregando sua experiência...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
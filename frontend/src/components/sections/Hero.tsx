import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fadeInLeft, fadeInRight } from '../../utils/animations';

const Hero = () => {
  const navigate = useNavigate();

  const handleTryDemo = () => {
    navigate('/upload');
  };

  return (
    <section className="bg-[#C1C899] min-h-screen flex items-center px-4 md:px-8 lg:px-12 py-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-center w-full">

        {/* Left Content */}
        <motion.div 
          className="flex flex-col space-y-5"
          variants={fadeInLeft}
          initial="hidden"
          animate="visible"
        >

          <motion.p 
            className="tracking-[0.15em] text-[#666666] text-xs font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Chat & Learn From Your Documents Using AI + Voice
          </motion.p>

          <motion.h1 
            className="text-6xl md:text-6xl lg:text-6xl font-black text-[#2D2424] leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            AI Document Tutor
          </motion.h1>

          <motion.p 
            className="text-[#5A5A5A] max-w-md text-sm leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Unlock the power of your documents. Upload, chat, and
            learn with AI-powered insights and voice interaction.
            Your personal tutor awaits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.button 
              onClick={handleTryDemo}
              className="bg-[#433535] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#2D2424] transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content */}
        <motion.div 
          className="relative flex items-center justify-end"
          variants={fadeInRight}
          initial="hidden"
          animate="visible"
        >
          <motion.img
            src="/images/hero.png"
            alt="AI Document Tutor"
            className="w-[90%] lg:w-[100%] max-w-none object-contain drop-shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;

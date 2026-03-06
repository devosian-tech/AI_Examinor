import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight } from '../../utils/animations';

const WhyChoose = () => {
  return (
    <section className="bg-white py-28 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* LEFT SIDE */}
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p 
            className="uppercase tracking-[0.3em] text-gray-500 text-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Product Highlights
          </motion.p>

          <motion.h2 
            className="text-5xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Why Choose Us?
          </motion.h2>

          <motion.p 
            className="text-gray-600 text-lg leading-relaxed mb-10 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Experience the future of learning with our intuitive interface,
            powerful AI, and flexible interaction modes. Personalized
            education at your fingertips.
          </motion.p>

          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {/* App store images temporarily disabled - add images to public/images/ */}
            {/* 
            <motion.img
              src="/images/google-play.png"
              alt="Google Play"
              className="h-12 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
            <motion.img
              src="/images/app-store.png"
              alt="App Store"
              className="h-12 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
            */}
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div 
          className="relative flex justify-center"
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >

          {/* Background Image */}
          <img
            src="/images/choose.png"
            alt="Background"
          />

        </motion.div>
      </div>
    </section>
  );
};

export default WhyChoose;

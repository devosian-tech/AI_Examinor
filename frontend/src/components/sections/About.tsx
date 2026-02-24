import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight } from '../../utils/animations';

const About = () => {
  return (
    <section className="bg-darkSection text-white py-24 px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div 
          className="relative"
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <img
            src="/images/about.png"
            alt="About"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p 
            className="uppercase tracking-widest text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            About Us
          </motion.p>

          <motion.h2 
            className="text-5xl font-bold mb-6 text-[#2D2424]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            About AI Document Tutor
          </motion.h2>

          <motion.p 
            className="text-[#666666] mb-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            We are dedicated to revolutionizing education and professional
            development through advanced AI. Our platform empowers users to
            learn efficiently from their own documents.
          </motion.p>

          <motion.button 
            className="bg-[#433535] text-white-900 px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            About Us
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default About;


import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const Testimonials = () => {
  return (
    <section className="bg-olive py-24 px-10">
      <motion.div 
        className="max-w-6xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="uppercase tracking-widest text-gray-700 mb-4">
          Testimonials
        </p>
        <h2 className="text-4xl font-bold">What Our Users Say</h2>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            variants={fadeInUp}
            className="bg-white p-8 rounded-xl shadow-md"
            whileHover={{ 
              y: -10,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              "This platform completely transformed my learning experience.
              The AI tutor is incredibly helpful."
            </motion.p>
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <img
                src="/images/voice.png"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-gray-500">
                  Student
                </p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;


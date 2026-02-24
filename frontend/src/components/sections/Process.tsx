import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const Process = () => {
  return (
    <section className="bg-darkbackground text-white py-24 px-10">
      <motion.div 
        className="max-w-5xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="uppercase tracking-widest text-[#7B6E6E] mb-4">
          Our Process
        </p>
        <h2 className="text-4xl font-bold text-[#2D2424]">How it Works</h2>
      </motion.div>

      <motion.div 
        className="max-w-2xl mx-auto space-y-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Step 1 */}
        <motion.div 
          className="flex flex-col md:flex-row rounded-xl overflow-hidden shadow-lg"
          variants={fadeInUp}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#c4a9a9] text-gray-900 flex items-center justify-center text-5xl font-bold p-10 md:w-1/4">
            01
          </div>
          <div className="bg-white text-gray-800 p-8 md:w-3/4">
            <h3 className="text-2xl font-semibold mb-4">Upload</h3>
            <p>
              Upload your documents in various formats. Our AI processes them
              to create a knowledge base for your learning journey. Secure and
              efficient.
            </p>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          className="flex flex-col md:flex-row-reverse rounded-xl overflow-hidden shadow-lg"
          variants={fadeInUp}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#c4a9a9] text-gray-900 flex items-center justify-center text-5xl font-bold p-10 md:w-1/4">
            02
          </div>
          <div className="bg-white text-gray-800 p-8 md:w-3/4">
            <h3 className="text-2xl font-semibold mb-4">Learn</h3>
            <p>
              Engage with AI using text or voice. Advanced speech recognition
              and synthesis make learning natural and accessible.
            </p>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          className="flex flex-col md:flex-row rounded-xl overflow-hidden shadow-lg"
          variants={fadeInUp}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#c4a9a9] text-gray-900 flex items-center justify-center text-5xl font-bold p-10 md:w-1/4">
            03
          </div>
          <div className="bg-white text-gray-800 p-8 md:w-3/4">
            <h3 className="text-2xl font-semibold mb-4">Interact</h3>
            <p>
              Choose your interaction mode: Chat to ask questions or Tutor to
              be quizzed. Tailor your learning experience to your needs.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Process;


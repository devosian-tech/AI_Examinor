import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight, staggerContainer, fadeInUp } from '../../utils/animations';

const SmartDocument = () => {
  return (
    <section className="bg-[#7B6E6E] pt-28 pb-40 px-6 lg:px-16 relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* LEFT SIDE */}
        <motion.div 
          className="text-white"
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p 
            className="uppercase tracking-[0.3em] text-sm mb-6 opacity-80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.8, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Document AI
          </motion.p>

          <motion.h2 
            className="text-5xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Smart Document <br /> Analysis
          </motion.h2>

          <motion.p 
            className="text-white/80 text-lg leading-relaxed mb-10 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Our AI understands your documents deeply, providing context-aware
            answers and insights. Unlock the full potential of your information.
          </motion.p>

          <motion.button 
            className="bg-[#C8D29D] text-black px-8 py-3 rounded-md font-semibold hover:opacity-90 transition"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div 
          className="relative flex justify-center"
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >

          {/* Main Image */}
          <img
            src="/images/smartdocument.png"
            alt="AI"
          />
        </motion.div>
      </div>

      {/* FEATURE CARDS */}
      <div className="absolute left-0 right-0 -bottom-48">
        <motion.div 
          className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 px-6 lg:px-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >

          {[
            {
              title: "Tutor Mode",
              desc: "AI asks you questions. Test your knowledge effectively.",
              image: "/images/tutor.png",
            },
            {
              title: "Chat Mode",
              desc: "Ask AI questions. Get instant answers.",
              image: "/images/chat.png",
            },
            {
              title: "Voice Chat",
              desc: "Speak your mind. Interact naturally.",
              image: "/images/voice-chat.png",
            },
            {
              title: "History",
              desc: "Review past conversations. Never lose progress.",
              image: "/images/history.png",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#C8D29D] p-8 rounded-xl shadow-lg"
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-8 h-8 object-contain"
                />
              </motion.div>

              <h3 className="text-lg font-bold mb-3">
                {item.title}
              </h3>

              <p className="text-sm text-gray-700">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SmartDocument;

import { motion } from 'framer-motion';
import { scaleIn, staggerContainer } from '../../utils/animations';

const Cards = () => {
  return (
    <section className="bg-white py-2 px-10">
      <motion.div 
        className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10 text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        
        {/* Tutor */}
        <motion.div 
          className="bg-blue-100 p-10 rounded-2xl shadow-md"
          variants={scaleIn}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <img src="/images/chat.png" alt="tutor"></img>
          </motion.div>
          <h3 className="text-2xl font-bold mb-4">Tutor</h3>
          <p className="text-gray-600 mb-6">
            Get quizzed by AI. Master your subjects.
          </p>
          <motion.button 
            className="text-primary font-semibold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Tutoring
          </motion.button>
        </motion.div>

        {/* Chat */}
        <motion.div 
          className="bg-yellow-100 p-10 rounded-2xl shadow-md"
          variants={scaleIn}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <img src="/images/voice-chat.png" alt="tutor"></img>
          </motion.div>
          <h3 className="text-2xl font-bold mb-4">Chat</h3>
          <p className="text-gray-600 mb-6">
            Ask AI anything. Get instant answers.
          </p>
          <motion.button 
            className="text-primary font-semibold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Chatting
          </motion.button>
        </motion.div>

        {/* Voice */}
        <motion.div 
          className="bg-green-100 p-10 rounded-2xl shadow-md"
          variants={scaleIn}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <img src="/images/voice.png" alt="tutor"></img>
          </motion.div>
          <h3 className="text-2xl font-bold mb-4">Voice</h3>
          <p className="text-gray-600 mb-6">
            Communicate naturally. AI understands you.
          </p>
          <motion.button 
            className="text-primary font-semibold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Voice
          </motion.button>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default Cards;


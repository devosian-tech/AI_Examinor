import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const Team = () => {
  const teamMembers = [
    { name: "John Doe", role: "AI Engineer", image: "team1.png" },
    { name: "Alice Brown", role: "UX Designer", image: "team2.jpeg" },
    { name: "Peter Jones", role: "Lead Developer", image: "team3.jpeg" },
    { name: "Jane Smith", role: "Product Manager", image: "team4.jpeg" },
  ];

  return (
    <section className="bg-white py-24 px-10">
      <motion.div 
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="uppercase tracking-widest text-gray-500 mb-4">
          Our Team
        </p>
        <h2 className="text-4xl font-bold">Meet Our Experts</h2>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="bg-gray-50 rounded-2xl p-8 text-center transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={`/images/${member.image}`}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <h3 className="font-bold text-xl mb-2">{member.name}</h3>
            <p className="text-gray-500 text-sm">{member.role}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation Arrows */}
      <motion.div 
        className="flex justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.button
          className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors"
          aria-label="Previous"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>
        <motion.button
          className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors"
          aria-label="Next"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Team;


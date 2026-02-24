import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/upload');
  };

  return (
    <section className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-20 px-10 text-center">
      <h2 className="text-4xl font-bold mb-6">
        Ready to Transform Your Learning?
      </h2>
      <button 
        onClick={handleGetStarted}
        className="bg-white text-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
      >
        Get Started Now
      </button>
    </section>
  );
};

export default CTA;


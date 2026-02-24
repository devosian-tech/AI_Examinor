const Features = () => {
  return (
    <section className="bg-white py-24 px-10">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="uppercase tracking-widest text-gray-500 mb-4">
          Features
        </p>
        <h2 className="text-4xl font-bold">Powerful AI Features</h2>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-8 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Smart Document Analysis</h3>
          <p className="text-gray-600">
            Our AI analyzes your documents to extract key information and create
            comprehensive study materials.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Personalized Learning</h3>
          <p className="text-gray-600">
            Get customized learning paths based on your goals and progress.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Interactive Quizzes</h3>
          <p className="text-gray-600">
            Test your knowledge with AI-generated quizzes and get instant feedback.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Voice Interaction</h3>
          <p className="text-gray-600">
            Learn hands-free with our advanced voice recognition and synthesis.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;


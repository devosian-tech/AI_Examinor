const Stats = () => {
  return (
    <section className="bg-[#7B6E6E] text-white py-16 px-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        <div>
          <h3 className="text-5xl font-bold">1000+</h3>
          <p className="mt-4 text-lg">Documents Processed</p>
          <p className="text-gray-300 text-sm mt-2">
            Trusted by learners worldwide.
          </p>
        </div>

        <div>
          <h3 className="text-5xl font-bold">2000+</h3>
          <p className="mt-4 text-lg">Sessions Completed</p>
          <p className="text-gray-300 text-sm mt-2">
            Learning sessions daily.
          </p>
        </div>

        <div>
          <h3 className="text-5xl font-bold">500+</h3>
          <p className="mt-4 text-lg">Active Users</p>
          <p className="text-gray-300 text-sm mt-2">
            Engaging with AI daily.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Stats;


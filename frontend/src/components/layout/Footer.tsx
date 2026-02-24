const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-xl mb-4">
            AI Tutor
          </h3>
          <p>
            Revolutionizing learning through AI-powered
            document interaction.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">
            Links
          </h4>
          <ul className="space-y-2">
            <li>About</li>
            <li>Services</li>
            <li>FAQ</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">
            Contact
          </h4>
          <p>Email: devosiantech@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


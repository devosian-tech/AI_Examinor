import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MorphingNav, NavItem } from '../ai/morphing-nav';

const Navbar = () => {
  const [activeNav, setActiveNav] = useState('courses');
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { id: 'courses', label: 'Courses', href: '#courses' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'service', label: 'Service', href: '#service' },
    { id: 'events', label: 'Events', href: '#events' },
    { id: 'blog', label: 'Blog', href: '#blog' },
  ];

  const handleGetStarted = () => {
    navigate('/upload');
  };

  return (
    <nav className="bg-olive py-6 px-10 flex justify-between items-center">
      <h1 
        className="text-2xl font-bold cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate('/')}
      >
        AI Tutor
      </h1>

      <div className="hidden md:block">
        <MorphingNav
          items={navItems}
          value={activeNav}
          onValueChange={setActiveNav}
          className="bg-white/80 backdrop-blur-sm border-gray-200"
          activeClass="bg-[#433535]"
          showIcons={false}
        />
      </div>

      <button 
        onClick={handleGetStarted}
        className="border border-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        Get Started
      </button>
    </nav>
  );
};

export default Navbar;


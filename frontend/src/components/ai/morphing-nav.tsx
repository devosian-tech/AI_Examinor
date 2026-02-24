import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Utility function to merge classNames
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

export type NavItem = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href: string;
};

type MorphingNavProps = {
  items: NavItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  itemClassName?: string;
  showIcons?: boolean;
  activeClass?: string;
  iconClass?: string;
};

export const MorphingNav = ({
  items,
  value,
  onValueChange,
  className,
  itemClassName,
  showIcons = true,
  activeClass = "bg-primary",
  iconClass = "h-5 w-5",
}: MorphingNavProps) => {
  const [internalValue, setInternalValue] = useState(
    value || items[0]?.id || ""
  );

  useEffect(() => {
    if (value) setInternalValue(value);
  }, [value]);

  const handleItemClick = (id: string, href: string) => {
    if (!value) setInternalValue(id);
    onValueChange?.(id);
    
    // Smooth scroll to section
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={cn(
        "border rounded-xl shadow-md p-2 overflow-x-auto",
        className
      )}
    >
      <div className="flex space-x-2">
        {items.map((item) => {
          const isActive = internalValue === item.id;
          const Icon = item.icon;

          return (
            <a
              href={item.href}
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item.id, item.href);
              }}
              className={cn(
                "relative px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap",
                "transition-colors group cursor-pointer",
                itemClassName,
                isActive
                  ? "text-white"
                  : "text-gray-700 hover:text-gray-900"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="morphing-nav-active"
                  className={cn("absolute inset-0 rounded-lg", activeClass)}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <motion.div
                className="relative z-10 flex items-center gap-2"
                transition={{ type: "spring", stiffness: 300 }}
              >
                {showIcons && Icon && (
                  <motion.span
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-inherit"
                        : "text-gray-400 group-hover:text-current",
                      iconClass
                    )}
                  >
                    <Icon className={iconClass} />
                  </motion.span>
                )}
                <span>{item.label}</span>
              </motion.div>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
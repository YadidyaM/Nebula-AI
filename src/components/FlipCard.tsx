import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  title: string;
  titleColor: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ frontContent, backContent, title, titleColor }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-full perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="w-full h-full relative preserve-3d cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-xl p-4 backdrop-blur-lg border border-gray-800`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <h2 className={`text-xl font-semibold mb-4 bg-clip-text text-transparent ${titleColor}`}>
            {title}
          </h2>
          {frontContent}
        </div>

        {/* Back */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-xl p-4 backdrop-blur-lg border border-gray-800`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <h2 className={`text-xl font-semibold mb-4 bg-clip-text text-transparent ${titleColor}`}>
            {title} Details
          </h2>
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard; 
import React from 'react';

const ISSLiveStream: React.FC = () => {
  return (
    <div className="w-full h-[480px] bg-gray-900 rounded-xl overflow-hidden">
      <div className="relative w-full h-full">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/9AkkhWswLBo?autoplay=1&mute=1&rel=0&modestbranding=1"
          title="NASA ISS Live Stream"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ISSLiveStream; 
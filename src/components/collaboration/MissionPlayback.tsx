import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

interface MissionEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  data: any;
}

const MissionPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events] = useState<MissionEvent[]>([
    {
      id: '1',
      timestamp: new Date(),
      type: 'SYSTEM_STATUS',
      description: 'Initial system check',
      data: {
        health: {
          propulsion: 100,
          navigation: 100,
          communication: 100,
          power: 100
        }
      }
    }
  ]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mission Playback</h2>
        <div className="flex items-center space-x-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value={0.5}>0.5x Speed</option>
            <option value={1}>1x Speed</option>
            <option value={2}>2x Speed</option>
            <option value={4}>4x Speed</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-indigo-600">
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlayback}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <button className="p-2 text-gray-500 hover:text-indigo-600">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={3600}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(3600)}</span>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium">Mission Events</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{event.type}</span>
                  <span className="text-sm text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionPlayback;
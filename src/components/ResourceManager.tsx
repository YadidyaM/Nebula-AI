import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Database, Signal, Clock, AlertTriangle, Users } from 'lucide-react';

const dataService = new DataService();

const ResourceManager = () => {
  const [satellites, setSatellites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const teamMembers = [
    { name: 'Meghana Nagaraja', username: '@meghana_01', url: 'https://lablab.ai/u/@meghana_01' },
    { name: 'Yadidya Medepalli', username: '@Yadidya', url: 'https://lablab.ai/u/@Yadidya' },
    { name: 'Monica Jayakumar', username: '@Mon_mj', url: 'https://lablab.ai/u/@Mon_mj' },
  ];

  useEffect(() => {
    const loadData = async () => {
      await dataService.loadData();
      const satData = dataService.getSatelliteCoordination();
      setSatellites(satData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Total Satellites</p>
              <p className="text-2xl font-semibold">{satellites.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <Signal className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Active Links</p>
              <p className="text-2xl font-semibold">
                {satellites.filter(s => s.status.link === 'Available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Active Conflicts</p>
              <p className="text-2xl font-semibold">
                {satellites.filter(s => s.status.conflict === 'Conflict').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Satellite Resource Coordination</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satellite ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ground Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bandwidth Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Throughput
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {satellites.map((satellite) => (
                <tr key={satellite.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {satellite.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {satellite.groundStation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{
                            width: `${(satellite.bandwidth.used / satellite.bandwidth.available) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round((satellite.bandwidth.used / satellite.bandwidth.available) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      satellite.status.link === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {satellite.status.link}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      satellite.priority === 'High'
                        ? 'bg-purple-100 text-purple-800'
                        : satellite.priority === 'Medium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {satellite.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {satellite.throughput} Mbps
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Team Members</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.username} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-indigo-600">{member.name}</h3>
              <a 
                href={member.url}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {member.username}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;
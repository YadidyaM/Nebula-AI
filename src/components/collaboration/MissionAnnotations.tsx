import React, { useState } from 'react';
import { BookmarkPlus, Trash2, Tag } from 'lucide-react';

interface Annotation {
  id: string;
  timestamp: Date;
  content: string;
  tags: string[];
  author: string;
}

const MissionAnnotations = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;

    const annotation: Annotation = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content: newAnnotation.trim(),
      tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
      author: 'Current User'
    };

    setAnnotations(prev => [...prev, annotation]);
    setNewAnnotation('');
    setNewTags('');
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mission Annotations</h2>
        <div className="text-sm text-gray-500">
          {annotations.length} annotations
        </div>
      </div>

      <form onSubmit={handleAddAnnotation} className="mb-6 space-y-4">
        <div>
          <label htmlFor="annotation" className="block text-sm font-medium text-gray-700">
            New Annotation
          </label>
          <textarea
            id="annotation"
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Add your annotation..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="e.g., important, follow-up, review"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={!newAnnotation.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          Add Annotation
        </button>
      </form>

      <div className="space-y-4">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{annotation.author}</span>
                  <span className="text-xs text-gray-500">
                    {annotation.timestamp.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{annotation.content}</p>
                {annotation.tags.length > 0 && (
                  <div className="mt-2 flex items-center flex-wrap gap-2">
                    {annotation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteAnnotation(annotation.id)}
                className="ml-4 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {annotations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No annotations yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionAnnotations;
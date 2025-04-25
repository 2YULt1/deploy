// pages/QuestionEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

export default function QuestionEditPage() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    type: 'single',
    stem: '',
    options: ['', ''],
    correctAnswers: [0],
    duration: 30,
    points: 1,
    mediaUrl: '',
    mediaType: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const res = await axios.get(`/games/${gameId}/questions/${questionId}`);
      setQuestion(res.data);
    } catch (err) {
      setError('Failed to fetch question');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (questionId) {
        await axios.put(`/games/${gameId}/questions/${questionId}`, question);
      } else {
        await axios.post(`/games/${gameId}/questions`, question);
      }
      navigate(`/games/${gameId}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (index) => {
    if (question.type === 'single') {
      setQuestion({ ...question, correctAnswers: [index] });
    } else {
      const newAnswers = question.correctAnswers.includes(index)
        ? question.correctAnswers.filter(i => i !== index)
        : [...question.correctAnswers, index];
      setQuestion({ ...question, correctAnswers: newAnswers });
    }
  };

  const addOption = () => {
    setQuestion({
      ...question,
      options: [...question.options, ''],
      correctAnswers: question.type === 'single' ? question.correctAnswers : [...question.correctAnswers]
    });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    const newAnswers = question.correctAnswers
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    setQuestion({
      ...question,
      options: newOptions,
      correctAnswers: newAnswers
    });
  };

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post(`/games/${gameId}/questions/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setQuestion({
        ...question,
        mediaUrl: res.data.url,
        mediaType: file.type.startsWith('image/') ? 'image' : 'video'
      });
    } catch (err) {
      setError('Failed to upload media');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {questionId ? 'Edit Question' : 'New Question'}
            </h1>
            <p className="text-gray-600">Configure your question settings</p>
          </div>
          <motion.button
            onClick={() => navigate(`/games/${gameId}/edit`)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </motion.button>
        </motion.div>

        {/* Question Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setQuestion({ ...question, type: 'single', correctAnswers: [question.correctAnswers[0] || 0] })}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    question.type === 'single'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Single Choice
                </button>
                <button
                  type="button"
                  onClick={() => setQuestion({ ...question, type: 'multiple' })}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    question.type === 'multiple'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Multiple Choice
                </button>
              </div>
            </div>

            {/* Question Stem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <textarea
                value={question.stem}
                onChange={(e) => setQuestion({ ...question, stem: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Media (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2">
                    {question.mediaType === 'image' ? (
                      <PhotoIcon className="h-5 w-5 text-gray-400" />
                    ) : question.mediaType === 'video' ? (
                      <VideoCameraIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <PlusIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-gray-600">
                      {question.mediaUrl ? 'Change Media' : 'Add Media'}
                    </span>
                  </div>
                </label>
                {question.mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setQuestion({ ...question, mediaUrl: '', mediaType: '' })}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCorrectAnswerChange(index)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        question.correctAnswers.includes(index)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {question.correctAnswers.includes(index) && (
                        <CheckIcon className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-5 w-5 text-gray-400" />
                  Add Option
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={question.duration}
                  onChange={(e) => setQuestion({ ...question, duration: parseInt(e.target.value) })}
                  min="5"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Saving...' : 'Save Question'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
// pages/QuestionEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function QuestionEditPage() {
  const { gameId, questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      const game = res.data.games.find(g => g.id === +gameId);
      const q = game.questions[+questionId];
      setQuestion(q);
      if (q.mediaUrl) {
        setMediaType(q.mediaUrl.includes('youtube.com') ? 'youtube' : 'image');
        setMediaUrl(q.mediaUrl);
      }
    });
  }, [gameId, questionId]);

  const save = async () => {
    const token = localStorage.getItem('token');
    const updatedQuestion = {
      ...question,
      mediaUrl: mediaType === 'none' ? '' : mediaUrl
    };
    const res = await axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } });
    const games = res.data.games;
    const gameIndex = games.findIndex(g => g.id === +gameId);
    games[gameIndex].questions[+questionId] = updatedQuestion;
    await axios.put('/admin/games', { games }, { headers: { Authorization: `Bearer ${token}` } });
    navigate(-1);
  };

  const addOption = () => {
    setQuestion({ ...question, options: [...question.options, ''] });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    setQuestion({ ...question, options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const toggleCorrect = (index) => {
    const newCorrect = question.type === 'single' ? [index] :
      question.correctAnswers.includes(index) ?
        question.correctAnswers.filter(i => i !== index) :
        [...question.correctAnswers, index];
    setQuestion({ ...question, correctAnswers: newCorrect });
  };

  if (!question) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Edit Question {+questionId + 1}</h3>
      
      <div className="space-y-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
          <select
            value={question.type}
            onChange={e => setQuestion({ ...question, type: e.target.value, correctAnswers: [] })}
            className="w-full p-2 border rounded"
          >
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
            <option value="judgement">Judgement</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <textarea
            value={question.stem}
            onChange={e => setQuestion({ ...question, stem: e.target.value })}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        {/* Media Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media Attachment</label>
          <select
            value={mediaType}
            onChange={e => setMediaType(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="none">None</option>
            <option value="youtube">YouTube Video</option>
            <option value="image">Image</option>
          </select>
          {mediaType !== 'none' && (
            <input
              type="text"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder={mediaType === 'youtube' ? 'YouTube URL' : 'Image URL'}
              className="w-full p-2 border rounded"
            />
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
          <input
            type="number"
            value={question.duration}
            onChange={e => setQuestion({ ...question, duration: +e.target.value })}
            className="w-full p-2 border rounded"
            min="5"
            max="300"
          />
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
          <input
            type="number"
            value={question.points}
            onChange={e => setQuestion({ ...question, points: +e.target.value })}
            className="w-full p-2 border rounded"
            min="1"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                checked={question.correctAnswers.includes(index)}
                onChange={() => toggleCorrect(index)}
                className="h-4 w-4"
              />
              <input
                type="text"
                value={option}
                onChange={e => updateOption(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => removeOption(index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
          {question.options.length < 6 && (
            <button
              onClick={addOption}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Option
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <motion.button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
        <motion.button
          onClick={save}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Save
        </motion.button>
      </div>
    </motion.div>
  );
}
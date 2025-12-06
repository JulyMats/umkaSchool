import React from 'react';

type Feedback = 'correct' | 'incorrect' | 'timeout' | null;

interface ExerciseFeedbackProps {
  feedback: Feedback;
  expectedAnswer: number | null;
}

const ExerciseFeedback: React.FC<ExerciseFeedbackProps> = ({ feedback, expectedAnswer }) => {
  if (!feedback) return null;

  const feedbackConfig = {
    correct: {
      emoji: '🎉',
      message: 'Fantastic! You nailed it! 🎊',
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
      border: 'border-green-300',
      text: 'text-green-800'
    },
    incorrect: {
      emoji: '😔',
      message: `Almost! The correct answer was ${expectedAnswer ?? 'N/A'}. Keep going! 💪`,
      bg: 'bg-gradient-to-r from-red-100 to-rose-100',
      border: 'border-red-300',
      text: 'text-red-800'
    },
    timeout: {
      emoji: '⏰',
      message: `Time's up! The right answer was ${expectedAnswer ?? 'N/A'}. Try once more! 🔄`,
      bg: 'bg-gradient-to-r from-red-100 to-rose-100',
      border: 'border-red-300',
      text: 'text-red-800'
    }
  };

  const config = feedbackConfig[feedback];

  return (
    <div className={`mt-6 rounded-2xl px-6 py-4 border-4 ${config.bg} ${config.border} ${config.text}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{config.emoji}</span>
        <div>
          <p className="text-lg font-bold">{config.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ExerciseFeedback;


import { Timer, TrendingUp, Play, Zap } from 'lucide-react';

export default function DailyChallenge() {
  return (
    <div className="bg-blue-50 p-4 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-blue-700 flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded-full aspect-square flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-700" />
          </div>
          Daily challenge
        </h3>
        <span className="text-sm text-blue-500 font-medium">Available now</span>
      </div>
      <div className="bg-blue-100 p-4 rounded-xl mb-4">
        <h4 className="font-semibold mb-2">Mixed Operations</h4>
        <p className="text-sm text-gray-600 mb-3">
          Solve 15 problems with mixed operations to earn bonus points!
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <p className="flex items-center gap-1"><Timer className="w-4 h-4" /> 10 mins</p>
          <p className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +50 points</p>
        </div>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-1">
        <Play className="w-4 h-4" /> Start Challenge
      </button>
    </div>
  );
}

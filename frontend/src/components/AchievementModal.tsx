import { Trophy, X } from 'lucide-react';
import { StudentAchievement } from '../services/achievement.service';

interface AchievementModalProps {
    achievement: StudentAchievement;
    onClose: () => void;
}

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
                // Close modal when clicking on backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6">
                    {/* Trophy Icon - Smaller */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-pink-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                            <Trophy className="w-16 h-16 text-pink-500 relative z-10 animate-bounce" />
                        </div>
                    </div>

                    {/* Achievement Icon - Larger */}
                    {achievement.iconUrl && (
                        <div className="flex justify-center -mt-6">
                            <img
                                src={achievement.iconUrl}
                                alt={achievement.name}
                                className="w-48 h-48 object-contain relative z-10"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Title - Pink colors */}
                    <div>
                        <h2 className="text-3xl font-bold text-pink-600 mb-2">
                            Achievement Unlocked!
                        </h2>
                        <h3 className="text-2xl font-semibold text-pink-500">
                            {achievement.name}
                        </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-lg">
                        {achievement.description}
                    </p>

                    {/* Points */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                        <p className="text-sm text-gray-500 mb-1">Points Earned</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            +{achievement.points}
                        </p>
                    </div>

                    {/* Close Button - Pink */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-colors shadow-lg"
                    >
                        Awesome!
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}


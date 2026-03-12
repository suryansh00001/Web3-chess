/**
 * GameStatus Component
 * 
 * Displays the current game status message with appropriate styling
 * Shows different colors/animations based on game state
 */

const GameStatus = ({ message, status, isCheck }) => {
  // Determine status styling
  const getStatusStyle = () => {
    if (status === 'finished') {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse';
    }
    if (isCheck) {
      return 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse';
    }
    if (status === 'playing') {
      return 'bg-gradient-to-r from-blue-600 to-cyan-600';
    }
    return 'bg-gradient-to-r from-gray-600 to-gray-700';
  };

  return (
    <div className={`${getStatusStyle()} rounded-lg p-4 shadow-lg`}>
      <p className="text-center text-white font-bold text-lg">
        {message}
      </p>
    </div>
  );
};

export default GameStatus;

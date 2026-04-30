import React from 'react';

/**
 * Progress Bar Component with step indicator
 */
function ProgressBar({ current = 0, total = 100, showPercentage = true, steps = null }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        {steps ? (
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div key={index} className="text-center flex-1">
                <div
                  className={`mx-auto w-3 h-3 rounded-full transition-all ${
                    index < current ? 'bg-green-500' : index === current ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                />
                <p className="text-xs text-slate-600 mt-1">{step}</p>
              </div>
            ))}
          </div>
        ) : null}
        {showPercentage && (
          <span className="text-sm font-semibold text-slate-700 ml-auto">{Math.round(percentage)}%</span>
        )}
      </div>
    </div>
  );
}

export default ProgressBar;

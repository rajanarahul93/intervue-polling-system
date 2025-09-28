import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { useSocket } from '../context/SocketContext';

const PollResults: React.FC = () => {
  const { currentPoll, results, totalVotes, hasVoted, selectedOption } = useAppSelector((state) => state.poll);
  const { user } = useSocket();
  const [animatedPercentages, setAnimatedPercentages] = useState<number[]>([]);

  useEffect(() => {
    if (!results) return;

    // Animate progress bars
    const percentages = results.map(r => r.percentage);
    setAnimatedPercentages(new Array(percentages.length).fill(0));
    
    setTimeout(() => {
      setAnimatedPercentages(percentages);
    }, 300);
  }, [results]);

  if (!currentPoll || !results) return null;

  const isTeacher = user?.type === 'teacher';
  const canAskNewQuestion = isTeacher && (!currentPoll.isActive || totalVotes === 0);

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 600 }}>
          Question 1
        </h2>
        {!currentPoll.isActive && (
          <div style={{
            background: 'var(--success-green)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-small)',
            fontWeight: 500
          }}>
            Completed
          </div>
        )}
      </div>

      {/* Question */}
      <div style={{
        background: 'var(--text-dark)',
        color: 'white',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-xl)',
        fontWeight: 500
      }}>
        {currentPoll.question}
      </div>

      {/* Results */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        {results.map((result, index) => {
          const isUserSelected = hasVoted && selectedOption === index;
          const animatedPercentage = animatedPercentages[index] || 0;
          
          return (
            <div key={index} style={{ marginBottom: 'var(--spacing-md)' }}>
              {/* Option Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--spacing-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isUserSelected ? 'var(--success-green)' : 'var(--primary-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {isUserSelected ? '✓' : String.fromCharCode(65 + index)}
                  </div>
                  <span style={{ 
                    fontWeight: 500,
                    color: 'var(--text-dark)'
                  }}>
                    {result.text}
                  </span>
                </div>
                <span style={{ 
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  fontSize: 'var(--font-size-body)'
                }}>
                  {result.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="progress-container" style={{ height: '32px' }}>
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${animatedPercentage}%`,
                    background: isUserSelected 
                      ? 'linear-gradient(90deg, var(--success-green), #059669)' 
                      : 'linear-gradient(90deg, var(--primary-purple), var(--secondary-purple))',
                    transition: 'width 0.8s ease-out',
                    justifyContent: 'flex-start',
                    paddingLeft: animatedPercentage > 15 ? 'var(--spacing-md)' : '0'
                  }}
                >
                  {animatedPercentage > 15 && (
                    <span style={{ 
                      color: 'white', 
                      fontWeight: 500,
                      fontSize: 'var(--font-size-small)'
                    }}>
                      {result.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vote Count */}
      <div style={{ 
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: 'var(--font-size-small)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        Total Responses: {totalVotes}
      </div>

      {/* Teacher Actions */}
      {isTeacher && canAskNewQuestion && (
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn-primary"
            style={{ minWidth: '200px' }}
            onClick={() => window.location.reload()} // Temporary - will be replaced with proper state management
          >
            + Ask a new question
          </button>
        </div>
      )}

      {/* Student Waiting State */}
      {!isTeacher && currentPoll.isActive && (
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
          <p style={{ color: 'var(--text-light)' }}>
            Wait for the teacher to ask a new question.
          </p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
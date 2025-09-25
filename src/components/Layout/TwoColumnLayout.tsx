import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TwoColumnLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialSplitPosition?: number;
  minWidth?: number;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftPanel,
  rightPanel,
  initialSplitPosition = 50,
  minWidth = 300,
}) => {
  const [splitPosition, setSplitPosition] = useState(initialSplitPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      const newSplitPosition = (mouseX / containerWidth) * 100;
      const minPercentage = (minWidth / containerWidth) * 100;
      const maxPercentage = 100 - minPercentage;

      if (newSplitPosition >= minPercentage && newSplitPosition <= maxPercentage) {
        setSplitPosition(newSplitPosition);
      }
    },
    [isDragging, minWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleLeftPanel = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    if (isRightCollapsed) setIsRightCollapsed(false);
  };

  const toggleRightPanel = () => {
    setIsRightCollapsed(!isRightCollapsed);
    if (isLeftCollapsed) setIsLeftCollapsed(false);
  };

  const getLeftWidth = () => {
    if (isLeftCollapsed) return '0%';
    if (isRightCollapsed) return '100%';
    return `${splitPosition}%`;
  };

  const getRightWidth = () => {
    if (isRightCollapsed) return '0%';
    if (isLeftCollapsed) return '100%';
    return `${100 - splitPosition}%`;
  };

  return (
    <div 
      ref={containerRef}
      className="flex h-screen bg-gray-100 select-none"
    >
      {/* Left Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isLeftCollapsed ? 'min-w-0' : 'min-w-[300px]'
        }`}
        style={{ width: getLeftWidth() }}
      >
        <div className="h-full flex flex-col bg-white shadow-sm">
          <div className="flex justify-between items-center p-2 border-b bg-gray-50">
            <h2 className={`font-semibold text-gray-800 ${isLeftCollapsed ? 'hidden' : ''}`}>
              Chat Interface
            </h2>
            <button
              onClick={toggleLeftPanel}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={isLeftCollapsed ? 'Expand chat panel' : 'Collapse chat panel'}
            >
              {isLeftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          <div className={`flex-1 overflow-hidden ${isLeftCollapsed ? 'hidden' : ''}`}>
            {leftPanel}
          </div>
        </div>
      </div>

      {/* Resizer */}
      {!isLeftCollapsed && !isRightCollapsed && (
        <div
          className={`w-1 bg-gray-300 cursor-col-resize hover:bg-blue-400 transition-colors ${
            isDragging ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Right Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isRightCollapsed ? 'min-w-0' : 'min-w-[300px]'
        }`}
        style={{ width: getRightWidth() }}
      >
        <div className="h-full flex flex-col bg-white shadow-sm">
          <div className="flex justify-between items-center p-2 border-b bg-gray-50">
            <button
              onClick={toggleRightPanel}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={isRightCollapsed ? 'Expand mapping panel' : 'Collapse mapping panel'}
            >
              {isRightCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <h2 className={`font-semibold text-gray-800 ${isRightCollapsed ? 'hidden' : ''}`}>
              Mapping Grid
            </h2>
          </div>
          <div className={`flex-1 overflow-hidden ${isRightCollapsed ? 'hidden' : ''}`}>
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
};
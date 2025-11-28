'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus, X, Check, Square, CheckSquare } from 'lucide-react';
import { SpaceTask } from '@/types';

interface AddTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<SpaceTask, 'id' | 'createdAt' | 'completed'>) => void;
  existingTasks?: SpaceTask[];
  onToggleTask?: (taskId: string) => void;
  onRemoveTask?: (taskId: string) => void;
}

export function AddTasksModal({
  isOpen,
  onClose,
  onAddTask,
  existingTasks = [],
  onToggleTask,
  onRemoveTask,
}: AddTasksModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTask = () => {
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && title.trim()) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const completedCount = existingTasks.filter((t) => t.completed).length;
  const totalCount = existingTasks.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Tasks" size="md">
      {/* Add new task form */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            Task title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="
              w-full px-3 py-2 rounded-xl
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={2}
            className="
              w-full px-3 py-2 rounded-xl resize-none
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <button
          onClick={handleAddTask}
          disabled={!title.trim()}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Existing tasks */}
      {existingTasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-os-border-dark">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-os-text-primary-dark">
              Tasks
            </h4>
            <span className="text-xs text-os-text-secondary-dark">
              {completedCount}/{totalCount} completed
            </span>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="h-1 bg-os-border-dark rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-brand-aperol transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {existingTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-colors
                  ${task.completed 
                    ? 'bg-os-surface-dark/50' 
                    : 'bg-os-surface-dark'
                  }
                `}
              >
                <button
                  onClick={() => onToggleTask?.(task.id)}
                  className="mt-0.5 flex-shrink-0 text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-brand-aperol" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm transition-colors ${
                      task.completed
                        ? 'text-os-text-secondary-dark line-through'
                        : 'text-os-text-primary-dark'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-os-text-secondary-dark mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                {onRemoveTask && (
                  <button
                    onClick={() => onRemoveTask(task.id)}
                    className="p-1 rounded hover:bg-os-border-dark text-os-text-secondary-dark hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-os-border-dark">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}



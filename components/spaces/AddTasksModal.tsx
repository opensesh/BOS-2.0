'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus, X, Square, CheckSquare, User } from 'lucide-react';
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
  const [assignee, setAssignee] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal animation completes
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAddTask = () => {
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assignee: assignee.trim() || undefined,
    });

    // Reset form and refocus for adding more tasks
    setTitle('');
    setDescription('');
    setAssignee('');
    titleInputRef.current?.focus();
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
    setAssignee('');
    onClose();
  };

  const completedCount = existingTasks.filter((t) => t.completed).length;
  const totalCount = existingTasks.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Tasks" size="md">
      {/* Add new task form */}
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="task-title"
            className="block text-sm font-medium text-os-text-primary-dark mb-1.5"
          >
            Task title
          </label>
          <input
            ref={titleInputRef}
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            autoComplete="off"
            className="
              w-full px-3 py-2.5 rounded-xl
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <div>
          <label 
            htmlFor="task-description"
            className="block text-sm font-medium text-os-text-primary-dark mb-1.5"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details (optional)"
            rows={2}
            className="
              w-full px-3 py-2.5 rounded-xl resize-none
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <div>
          <label 
            htmlFor="task-assignee"
            className="block text-sm font-medium text-os-text-primary-dark mb-1.5"
          >
            Assignee
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
            <input
              id="task-assignee"
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Assign to someone (optional)"
              autoComplete="off"
              className="
                w-full pl-10 pr-3 py-2.5 rounded-xl
                bg-os-border-dark border border-os-border-dark
                text-os-text-primary-dark placeholder-os-text-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
                transition-colors
              "
            />
          </div>
        </div>
      </div>

      {/* Existing tasks */}
      {existingTasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-os-border-dark">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-os-text-primary-dark">
              Tasks ({totalCount})
            </h4>
            <span className="text-xs text-os-text-secondary-dark">
              {completedCount} of {totalCount} completed
            </span>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div 
              className="h-1.5 bg-os-border-dark rounded-full mb-4 overflow-hidden"
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
              aria-label={`${completedCount} of ${totalCount} tasks completed`}
            >
              <div
                className="h-full bg-brand-aperol transition-all duration-300 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {existingTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  flex items-start gap-3 p-3 rounded-xl transition-all duration-200
                  ${task.completed 
                    ? 'bg-os-surface-dark/50' 
                    : 'bg-os-surface-dark hover:bg-os-surface-dark/80'
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => onToggleTask?.(task.id)}
                  disabled={!onToggleTask}
                  className="mt-0.5 flex-shrink-0 text-os-text-secondary-dark hover:text-brand-aperol transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
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
                  {task.assignee && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <User className="w-3 h-3 text-os-text-secondary-dark" />
                      <span className="text-xs text-os-text-secondary-dark">{task.assignee}</span>
                    </div>
                  )}
                </div>
                {onRemoveTask && (
                  <button
                    type="button"
                    onClick={() => onRemoveTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-os-border-dark text-os-text-secondary-dark hover:text-red-500 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    aria-label={`Remove task "${task.title}"`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with action buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-os-border-dark">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol/50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAddTask}
          disabled={!title.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-aperol/50"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
    </Modal>
  );
}

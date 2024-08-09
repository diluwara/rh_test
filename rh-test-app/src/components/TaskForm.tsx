import React, { useState } from 'react';
import { createTask, updateTask } from '../service/api';
import UserSelect from './UserSelect';
import '../style/TaskForm.css'; // Import the CSS file

interface Task {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
  user_id: number;
}

interface TaskFormProps {
  task?: Task | null; // Adjusted to handle null
  onSave: () => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [completed, setCompleted] = useState(task?.completed || false);
  const [userId, setUserId] = useState(task?.user_id || 0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false); // Added loading state
  const [saveError, setSaveError] = useState<string | null>(null); // Track save errors

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!title) errors.title = 'Title is required.';
    if (userId === 0) errors.userId = 'User selection is required.';
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true); // Start loading
    setSaveError(null); // Reset error before attempting to save
    try {
      if (task) {
        await updateTask(task.id, { title, description, completed });
      } else {
        await createTask({ title, description, user_id: userId });
      }
      onSave();
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error saving task:', error);
      setSaveError('Error saving task.'); // Set error message
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="task-form-container">
      <div className="task-form-fields">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>
          Completed
          <input
            type="checkbox"
            checked={completed}
            onChange={() => setCompleted(!completed)}
          />
        </label>
        <UserSelect selectedUserId={userId} onSelect={setUserId} />
        {errors.userId && <p className="error-text">{errors.userId}</p>}
      </div>
      {saveError && <p className="error-text">{saveError}</p>}
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default TaskForm;
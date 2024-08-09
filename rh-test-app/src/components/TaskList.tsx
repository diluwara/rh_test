import React, { useEffect, useState } from 'react';
import { getTasks, deleteTask } from '../service/api';
import TaskForm from './TaskForm';
import '../style/TaskList.css'; // Import the CSS file

interface Task {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
  user_id: number;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskList = await getTasks();
        setTasks(taskList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks');
      }
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      // Display the error message
      setError('Unable to delete task');
    }
  };

  const handleSave = () => {
    setShowTaskForm(false);
    const fetchTasks = async () => {
      try {
        const taskList = await getTasks();
        setTasks(taskList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  };

  const openTaskForm = (task?: Task) => {
    setEditingTask(task || null);
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setEditingTask(null);
    setShowTaskForm(false);
  };

  return (
    <div className="task-list-container">
      <button onClick={() => openTaskForm()}>Add Task</button>
      {error && <p className="error-message">{error}</p>}
      {showTaskForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeTaskForm} role="button">
              &times;
            </span>
            <TaskForm task={editingTask} onSave={handleSave} onClose={closeTaskForm} />
          </div>
        </div>
      )}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.title}</span>
            <button onClick={() => openTaskForm(task)}>Edit</button>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
import React from 'react';
import TaskList from './components/TaskList';
import UserList from './components/UserList';
import "./App.css"

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Task and User Manager</h1>
      </header>
      <div className="content">
        <UserList />
        <TaskList />
      </div>
    </div>
  );
};

export default App;

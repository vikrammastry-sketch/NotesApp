/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Trash2, X } from 'lucide-react';

// Mock data for tasks
const initialTasks = [
  { id: '1', title: 'Review homepage redesign mockups', completed: false, dueDate: null },
  { id: '2', title: 'Send project brief to client', completed: false, dueDate: null },
  { id: '3', title: 'Prepare Q2 design roadmap', completed: false, dueDate: '2026-02-24' },
  { id: '4', title: 'Update Figma component library', completed: false, dueDate: '2026-02-18' },
  { id: '5', title: 'Schedule team standup', completed: true, dueDate: null },
];

// Mock data for calendar events
const calendarEvents = [
  { id: 'e1', title: 'Design Weekly Sync', time: '9:00 AM – 9:45 AM' },
  { id: 'e2', title: 'Product Roadmap Review', time: '11:00 AM – 12:00 PM' },
  { id: 'e3', title: '1:1 with Engineering Lead', time: '2:00 PM – 2:30 PM' },
  { id: 'e4', title: 'Stakeholder Presentation', time: '4:00 PM – 5:00 PM' },
];

// Mock data for upcoming view
const upcomingData = [
  {
    date: 'MONDAY, FEB 23',
    tasks: [{ id: 'u1', title: 'Finalise onboarding flow wireframes', completed: false, dueDate: null }],
    events: [{ id: 'ue1', title: 'Design Review', time: '10:00 AM' }],
  },
  {
    date: 'TUESDAY, FEB 24',
    tasks: [
      { id: 'u2', title: 'Send revised proposal to client', completed: false, dueDate: null },
      { id: 'u3', title: 'Update Figma component library', completed: false, dueDate: '2026-02-18' },
    ],
    events: [{ id: 'ue2', title: 'All Hands Meeting', time: '3:00 PM' }],
  },
  {
    date: 'WEDNESDAY, FEB 25',
    tasks: [],
    events: [],
  },
  {
    date: 'THURSDAY, FEB 26',
    tasks: [],
    events: [],
  },
  {
    date: 'FRIDAY, FEB 27',
    tasks: [],
    events: [],
  },
  {
    date: 'SATURDAY, FEB 28',
    tasks: [],
    events: [],
  },
  {
    date: 'SUNDAY, MAR 1',
    tasks: [],
    events: [],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastDeletedTask, setLastDeletedTask] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingTaskInput, setOnboardingTaskInput] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<'taskLimit' | 'calendarLimit' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);

  const today = new Date('2026-02-22T00:00:00'); // Hardcoded for consistency with mock data
  const todayFormatted = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskTitle.trim() !== '') {
      const newId = String(tasks.length + 1);
      setTasks([{ id: newId, title: newTaskTitle.trim(), completed: false, dueDate: null }, ...tasks]);
      setNewTaskTitle('');
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete) {
      setLastDeletedTask(taskToDelete);
      setTasks(tasks.filter(task => task.id !== id));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleUndoDelete = () => {
    if (lastDeletedTask) {
      setTasks(prevTasks => [lastDeletedTask, ...prevTasks]);
      setLastDeletedTask(null);
      setShowToast(false);
    }
  };

  const handleEditTaskTitle = (id: string, newTitle: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title: newTitle.trim() } : task
    ));
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleDateChange = (taskId: string, date: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, dueDate: date } : task
    ));
    setShowDatePicker(null);
  };

  const renderTask = (task: any, isUpcomingView = false) => {
    const isPastDue = task.dueDate && new Date(task.dueDate) < today && !task.completed;
    const isFutureDue = task.dueDate && new Date(task.dueDate) > today && !task.completed;

    return (
      <div key={task.id} className="flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => handleToggleComplete(task.id)}
          className="form-checkbox h-4 w-4 text-black rounded border-gray-300 focus:ring-black transition-colors duration-200"
        />
        <div className="ml-3 flex-1">
          {editingTaskId === task.id ? (
            <input
              type="text"
              value={editingTaskTitle}
              onChange={(e) => setEditingTaskTitle(e.target.value)}
              onBlur={() => handleEditTaskTitle(task.id, editingTaskTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditTaskTitle(task.id, editingTaskTaskTitle);
                }
              }}
              className="w-full bg-transparent border-b border-black focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <span
              className={`text-sm ${task.completed ? 'line-through text-color-muted-text' : 'text-color-base-text'}`}
              onClick={() => {
                setEditingTaskId(task.id);
                setEditingTaskTitle(task.title);
              }}
            >
              {task.title}
            </span>
          )}
          {task.dueDate && (
            <p className={`text-xs mt-1 ${isPastDue ? 'text-red-500' : 'text-color-muted-text'}`}>
              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
        {!task.completed && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="relative">
              <button
                className="p-1 rounded-md hover:bg-gray-200"
                onClick={() => setShowDatePicker(showDatePicker === task.id ? null : task.id)}
              >
                <CalendarIcon size={16} className="text-color-muted-text" />
              </button>
              {showDatePicker === task.id && (
                <div className="absolute z-10 bg-white border border-color-border rounded-lg shadow-md p-2 mt-1 right-0">
                  <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => handleDateChange(task.id, e.target.value)}
                    className="text-sm p-1 focus:outline-none"
                  />
                </div>
              )}
            </div>
            <button
              className="p-1 rounded-md hover:bg-gray-200"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash2 size={16} className="text-color-muted-text" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed).sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col h-screen font-sans antialiased">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-color-border shadow-sm">
        <div className="font-bold text-lg text-color-base-text">Focus</div>
        <div className="flex items-center space-x-4">
          <button
            className="text-xs text-color-muted-text border border-color-border rounded-md px-3 py-1 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => {
              setUpgradeModalTrigger('taskLimit');
              setShowUpgradeModal(true);
            }}
          >
            Task Limit
          </button>
          <button
            className="text-xs text-color-muted-text border border-color-border rounded-md px-3 py-1 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => {
              setUpgradeModalTrigger('calendarLimit');
              setShowUpgradeModal(true);
            }}
          >
            Calendar Limit
          </button>
          <button
            className="text-xs text-color-muted-text border border-color-border rounded-md px-3 py-1 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setShowOnboarding(true)}
          >
            Preview Onboarding
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">PM</div>
            <span className="text-sm text-color-muted-text">Priya Mehta</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'today' ? (
          <div className="flex h-full">
            {/* Today View - Left Column */}
            <div className="w-[60%] bg-white p-6 overflow-y-auto">
              <h1 className="text-2xl font-bold text-color-base-text mb-4">Today</h1>
              <p className="text-sm text-color-muted-text mb-5">{todayFormatted}</p>

              {/* Task Capture Input */}
              <input
                type="text"
                placeholder="Add a task..."
                className="w-full p-3 border border-color-border rounded-md text-sm focus:outline-none focus:border-black transition-colors duration-200 mb-6"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleAddTask}
              />

              {/* Incomplete Tasks */}
              <div className="space-y-2">
                {incompleteTasks.map(task => renderTask(task))}
              </div>

              {/* Completed Tasks Section */}
              {completedTasks.length > 0 && (
                <div className="mt-6">
                  <div className="relative flex items-center justify-center my-6">
                    <div className="flex-grow border-t border-color-border"></div>
                    <span className="flex-shrink mx-4 text-xs uppercase text-color-muted-text">COMPLETED</span>
                    <div className="flex-grow border-t border-color-border"></div>
                  </div>
                  <div className="space-y-2">
                    {completedTasks.map(task => renderTask(task))}
                  </div>
                </div>
              )}
            </div>

            {/* Today View - Right Column (Calendar) */}
            <div className="w-[40%] bg-[#F8F9FA] p-6 border-l border-color-border overflow-y-auto">
              <h2 className="text-2xl font-bold text-color-base-text mb-2">Calendar</h2>
              <div className="flex items-center mb-5">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-color-muted-text">Google Calendar · Today</span>
              </div>
              <div className="space-y-3">
                {calendarEvents.map(event => (
                  <div key={event.id} className="flex bg-white border border-color-border rounded-lg p-3 shadow-sm">
                    <div className="w-1 h-auto bg-color-brand-accent rounded-sm mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-color-base-text">{event.title}</p>
                      <p className="text-xs text-color-muted-text mt-1">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold text-color-base-text mb-1">Upcoming</h1>
            <p className="text-sm text-color-muted-text mb-6">Next 7 days</p>

            <div className="space-y-7">
              {upcomingData.map((day, index) => (
                <div key={index}>
                  <h3 className="text-xs uppercase font-bold text-color-muted-text mb-3">{day.date}</h3>
                  <div className="border-b border-color-border mb-4"></div>
                  {day.tasks.length === 0 && day.events.length === 0 ? (
                    <p className="text-sm text-color-muted-text italic mt-3">A clear day. Keep it that way.</p>
                  ) : (
                    <div className="space-y-2">
                      {day.tasks.map(task => renderTask(task, true))}
                      {day.events.map(event => (
                        <div key={event.id} className="flex items-center text-sm text-color-muted-text">
                          <span className="w-2 h-2 bg-color-brand-accent rounded-full mr-2"></span>
                          <span>{event.title} · {event.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex items-center justify-center h-13 bg-white border-t border-color-border shadow-sm">
        <div className="flex space-x-8">
          <button
            className={`relative px-4 py-2 text-sm font-medium ${activeTab === 'today' ? 'text-color-base-text font-bold' : 'text-gray-400'}`}
            onClick={() => setActiveTab('today')}
          >
            Today
            {activeTab === 'today' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></motion.div>}
          </button>
          <button
            className={`relative px-4 py-2 text-sm font-medium ${activeTab === 'upcoming' ? 'text-color-base-text font-bold' : 'text-gray-400'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
            {activeTab === 'upcoming' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></motion.div>}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-md shadow-lg flex items-center space-x-2"
          >
            <span>Task deleted</span>
            <button className="text-color-brand-accent font-medium" onClick={handleUndoDelete}>Undo</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full relative"
            >
              {onboardingStep > 1 && (
                <button
                  className="absolute top-6 left-6 text-color-muted-text hover:text-color-base-text"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                >
                  &larr; Back
                </button>
              )}
              {/* Progress Dots */}
              <div className="flex justify-center space-x-2 mb-7">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${onboardingStep === step ? 'bg-black' : 'border border-gray-300'}`}
                  ></div>
                ))}
              </div>

              {onboardingStep === 1 && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-3">Welcome to Focus</h2>
                  <p className="text-base text-color-muted-text mb-6">See your tasks and calendar in one place.</p>
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400 mb-7">
                    ✦ Illustration
                  </div>
                  <button
                    className="w-full bg-black text-white py-3 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => setOnboardingStep(2)}
                  >
                    Get Started &rarr;
                  </button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-3">Connect your calendar</h2>
                  <p className="text-base text-color-muted-text mb-6">See your meetings alongside your tasks.</p>
                  <div className="w-full h-14 border border-color-border rounded-lg flex items-center justify-center space-x-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="text-sm text-color-base-text">Connect Google Calendar</span>
                  </div>
                  <button
                    className="w-full bg-black text-white py-3 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors duration-200 mb-4"
                    onClick={() => setOnboardingStep(3)}
                  >
                    Continue &rarr;
                  </button>
                  <button
                    className="text-sm text-color-muted-text underline hover:text-color-base-text"
                    onClick={() => setOnboardingStep(3)}
                  >
                    I'll do this later
                  </button>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-3">Add your first task</h2>
                  <p className="text-base text-color-muted-text mb-6">Try: 'Review homepage designs'</p>
                  <input
                    type="text"
                    placeholder="Add a task..."
                    className="w-full p-3 border border-color-border rounded-md text-sm focus:outline-none focus:border-black transition-colors duration-200 mb-6"
                    value={onboardingTaskInput}
                    onChange={(e) => setOnboardingTaskInput(e.target.value)}
                  />
                  <button
                    className={`w-full py-3 rounded-lg text-base font-medium transition-colors duration-200 ${onboardingTaskInput.trim() === '' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                    onClick={() => onboardingTaskInput.trim() !== '' && setShowOnboarding(false)}
                    disabled={onboardingTaskInput.trim() === ''}
                  >
                    Done &rarr;
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-9 max-w-lg w-full relative"
            >
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                onClick={() => setShowUpgradeModal(false)}
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-color-base-text mb-2">You're running Focus like a pro.</h2>
              <p className="text-sm text-color-muted-text mb-6">
                {upgradeModalTrigger === 'taskLimit'
                  ? "You've reached 30 tasks on the free plan."
                  : "Connect more calendars on the Pro plan."}
              </p>

              {/* Feature Comparison Table */}
              <div className="rounded-lg overflow-hidden border border-color-border mb-6">
                <table className="min-w-full divide-y divide-color-border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider bg-black">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-color-border text-sm">
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-color-base-text">Calendars</td>
                      <td className="px-4 py-3 text-center text-color-base-text">1</td>
                      <td className="px-4 py-3 text-center text-white bg-black">Unlimited</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 text-color-base-text">Active Tasks</td>
                      <td className="px-4 py-3 text-center text-color-base-text">30</td>
                      <td className="px-4 py-3 text-center text-white bg-black">Unlimited</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-color-base-text">Upcoming View</td>
                      <td className="px-4 py-3 text-center text-color-muted-text">&times;</td>
                      <td className="px-4 py-3 text-center text-green-500">&#10003;</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 text-color-base-text">Future Features</td>
                      <td className="px-4 py-3 text-center text-color-muted-text">&times;</td>
                      <td className="px-4 py-3 text-center text-green-500">&#10003;</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button className="w-full bg-black text-white py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors duration-200 mb-4">
                Upgrade to Pro — ₹299/month
              </button>
              <button
                className="block w-full text-center text-sm text-color-muted-text underline hover:text-color-base-text"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

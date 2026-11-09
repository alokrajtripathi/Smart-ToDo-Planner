import { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarDays, CheckCircle2, Clock,
  Plus, Search, Bell, Settings, Menu, X, Trash2,
  Circle, ListTodo, Pencil, AlertCircle, ArrowUpDown,
  CheckSquare, Square, ListChecks
} from "lucide-react";

function App() {

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smart-todo-tasks")) || [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    localStorage.setItem("smart-todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Add Task Modal
  const openAddModal = () => {
    setEditingId(null);
    setTaskInput("");
    setPriority("Medium");
    setDueDate("");
    setShowModal(true);
  };

  // Edit Task Modal
  const openEditModal = (task) => {
    setEditingId(task.id);
    setTaskInput(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setShowModal(true);
  };

  // Save Task
  const saveTask = (e) => {
    e.preventDefault();

    if (!taskInput.trim()) return;

    if (editingId !== null) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingId
            ? { ...task, title: taskInput.trim(), priority, dueDate }
            : task
        )
      );
    } else {
      setTasks(prev => [
        ...prev,
        {
          id: Date.now(),
          title: taskInput.trim(),
          priority,
          completed: false,
          date: today,
          dueDate
        }
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setTaskInput("");
    setPriority("Medium");
    setDueDate("");
  };

  // Toggle Complete
  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Delete Single Task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setSelectedIds(prev => prev.filter(item => item !== id));
  };

  // Select / Deselect Task
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Select All Visible Tasks
  const selectAll = (visibleTasks) => {
    const allSelected = visibleTasks.every(task =>
      selectedIds.includes(task.id)
    );

    if (allSelected) {
      setSelectedIds(prev =>
        prev.filter(id => !visibleTasks.some(task => task.id === id))
      );
    } else {
      setSelectedIds(prev =>
        [...new Set([...prev, ...visibleTasks.map(task => task.id)])]
      );
    }
  };

  // Bulk Mark Completed
  const markSelectedDone = () => {
    setTasks(prev =>
      prev.map(task =>
        selectedIds.includes(task.id)
          ? { ...task, completed: true }
          : task
      )
    );

    setSelectedIds([]);
  };

  // Bulk Delete
  const deleteSelected = () => {
    if (!selectedIds.length) return;

    if (!window.confirm(`Delete ${selectedIds.length} selected tasks?`)) return;

    setTasks(prev =>
      prev.filter(task => !selectedIds.includes(task.id))
    );

    setSelectedIds([]);
  };

  // Clear Completed
  const clearCompleted = () => {
    if (!tasks.some(task => task.completed)) return;

    if (!window.confirm("Delete all completed tasks?")) return;

    setTasks(prev => prev.filter(task => !task.completed));
    setSelectedIds([]);
  };

  // Statistics
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  const overdue = tasks.filter(task =>
    !task.completed && task.dueDate && task.dueDate < today
  ).length;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  // Filter and Search
  const filteredTasks = tasks.filter(task => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && !task.completed) ||
      (filter === "Completed" && task.completed);

    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sorting
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      return (priorityOrder[a.priority] || 2) -
        (priorityOrder[b.priority] || 2);
    }

    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (sortBy === "oldest") {
      return a.id - b.id;
    }

    return b.id - a.id;
  });

  const priorityColors = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-amber-100 text-amber-600",
    Low: "bg-green-100 text-green-600"
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-6 transition-transform md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>

        <div className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <CheckCircle2 size={25}/>
          </div>

          <h1 className="text-xl font-bold">TaskFlow</h1>

          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X/>
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-400 mb-4">MENU</p>

        <nav className="space-y-2">

          {[
            { name: "All", label: "Dashboard", icon: LayoutDashboard },
            { name: "Active", label: "My Tasks", icon: CalendarDays },
            { name: "Completed", label: "Completed", icon: CheckCircle2 }
          ].map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setFilter(item.name)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl ${
                  filter === item.name
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "hover:bg-slate-100"
                }`}
              >
                <Icon size={19}/>
                {item.label}
              </button>
            );
          })}

        </nav>

        <div className="absolute bottom-8 left-6">
          <button className="flex items-center gap-3 p-3 text-slate-500">
            <Settings size={19}/>
            Settings
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 p-5 md:p-10">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">

          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu/>
            </button>

            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-slate-500 text-sm">Manage your daily activities.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Bell className="text-slate-500"/>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              A
            </div>
          </div>

        </header>

        {/* WELCOME */}
        <section className="bg-indigo-600 rounded-2xl p-7 text-white mb-8">

          <h2 className="text-2xl font-bold mb-2">Welcome Back! 👋</h2>
          <p className="text-indigo-100">Stay organized and make today productive.</p>

          <button
            onClick={openAddModal}
            className="mt-5 bg-white text-indigo-600 px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={19}/>
            Add New Task
          </button>

        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {[
            { label: "Total Tasks", value: tasks.length, icon: ListTodo, color: "text-indigo-600" },
            { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-600" },
            { label: "Pending", value: pending, icon: Clock, color: "text-amber-500" },
            { label: "Overdue", value: overdue, icon: AlertCircle, color: "text-red-500" }
          ].map(item => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="bg-white p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <p className="text-slate-500">{item.label}</p>
                  <Icon className={item.color}/>
                </div>
                <h2 className={`text-3xl font-bold mt-3 ${item.label === "Overdue" ? "text-red-500" : ""}`}>
                  {item.value}
                </h2>
              </div>
            );
          })}

        </section>

        {/* PROGRESS */}
        <section className="bg-white rounded-2xl p-6 mb-8 border border-slate-100">

          <div className="flex justify-between mb-3">
            <h3 className="font-bold">Overall Progress</h3>
            <span className="text-indigo-600 font-bold">{progress}%</span>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

        </section>

        {/* TASK SECTION */}
        <section className="bg-white rounded-2xl p-6 border border-slate-100">

          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">

            <h3 className="text-xl font-bold">My Tasks</h3>

            <div className="flex flex-wrap gap-3">

              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-slate-400"/>

                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="border border-slate-200 rounded-xl pl-10 pr-4 py-2 outline-none"
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
              </select>

            </div>

          </div>

          {/* FILTERS */}
          <div className="flex gap-2 mb-6 flex-wrap">

            {["All", "Active", "Completed"].map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  filter === item
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

          {/* BULK ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 mb-5">

            <button
              onClick={() => selectAll(sortedTasks)}
              className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              <CheckSquare size={17}/>
              Select All
            </button>

            <span className="text-sm text-slate-500">
              {selectedIds.length} selected
            </span>

            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={markSelectedDone}
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={16}/>
                  Mark Done
                </button>

                <button
                  onClick={deleteSelected}
                  className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Trash2 size={16}/>
                  Delete Selected
                </button>
              </>
            )}

            <button
              onClick={clearCompleted}
              className="ml-auto text-sm text-red-500 hover:text-red-700"
            >
              Clear Completed
            </button>

          </div>

          {/* TASK LIST */}
          <div className="space-y-3">

            {sortedTasks.length === 0 ? (

              <div className="text-center py-12 text-slate-400">
                <ListTodo size={40} className="mx-auto mb-3"/>
                <p>No tasks found. Add your first task!</p>
              </div>

            ) : (

              sortedTasks.map(task => {

                const isOverdue =
                  !task.completed && task.dueDate && task.dueDate < today;

                return (

                  <div
                    key={task.id}
                    className={`flex flex-wrap items-center gap-3 p-4 border rounded-xl ${
                      isOverdue
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >

                    <button onClick={() => toggleSelect(task.id)}>
                      {selectedIds.includes(task.id)
                        ? <CheckSquare className="text-indigo-600"/>
                        : <Square className="text-slate-400"/>
                      }
                    </button>

                    <button onClick={() => toggleTask(task.id)}>
                      {task.completed
                        ? <CheckCircle2 className="text-green-600"/>
                        : <Circle className="text-slate-400"/>
                      }
                    </button>

                    <div className="flex-1 min-w-0">

                      <p className={`font-medium break-words ${
                        task.completed ? "line-through text-slate-400" : ""
                      }`}>
                        {task.title}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-2 text-xs">

                        <span className="text-slate-400">
                          Created: {task.date || "Earlier"}
                        </span>

                        {task.dueDate && (
                          <span className={isOverdue ? "text-red-600 font-semibold" : "text-slate-500"}>
                            {isOverdue ? "Overdue: " : "Due: "}
                            {task.dueDate}
                          </span>
                        )}

                      </div>

                      {isOverdue && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                          <AlertCircle size={14}/>
                          Deadline has passed!
                        </p>
                      )}

                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full ${
                      priorityColors[task.priority] || priorityColors.Medium
                    }`}>
                      {task.priority || "Medium"}
                    </span>

                    <button
                      onClick={() => openEditModal(task)}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <Pencil size={18}/>
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18}/>
                    </button>

                  </div>

                );
              })

            )}

          </div>

        </section>

      </main>

      {/* ADD / EDIT MODAL */}
      {showModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <form
            onSubmit={saveTask}
            className="bg-white rounded-2xl p-7 w-full max-w-md shadow-xl"
          >

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-bold">
                {editingId !== null ? "Edit Task" : "Create New Task"}
              </h2>

              <button type="button" onClick={() => setShowModal(false)}>
                <X/>
              </button>

            </div>

            <label className="text-sm font-medium">Task Name</label>

            <input
              autoFocus
              required
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              placeholder="Enter your task..."
              className="w-full border border-slate-200 rounded-xl p-3 mt-2 mb-5 outline-none focus:border-indigo-500"
            />

            <label className="text-sm font-medium">Priority</label>

            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 mt-2 mb-5"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label className="text-sm font-medium">Due Date</label>

            <input
              type="date"
              min={today}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 mt-2 mb-6"
            />

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border p-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white p-3 rounded-xl"
              >
                {editingId !== null ? "Save Changes" : "Add Task"}
              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  );
}

export default App;
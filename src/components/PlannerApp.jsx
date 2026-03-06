import { useEffect, useState } from 'react';
import ModuleCard from './ModuleCard';
import ReflectionCard from './ReflectionCard';
import { plannerStorage } from '../services/plannerStorage';

function isoDate() {
  return new Date().toISOString().split('T')[0];
}

function parseTarget(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function createTask(text, targetValue) {
  const target = parseTarget(targetValue);
  return { text, done: false, target, count: 0 };
}

export default function PlannerApp() {
  const [selectedDate, setSelectedDate] = useState(isoDate());
  const [day, setDay] = useState(null);
  const [ui, setUi] = useState({
    work: { showMain: false, showTask: false, mainText: '', mainTarget: '', taskText: '', taskTarget: '' },
    life: { showMain: false, showTask: false, mainText: '', mainTarget: '', taskText: '', taskTarget: '' }
  });

  useEffect(() => {
    setDay(plannerStorage.getDay(selectedDate));
  }, [selectedDate]);


  function persist(nextDay) {
    setDay(nextDay);
    plannerStorage.saveDay(selectedDate, nextDay);
  }

  function addMain(type, text, targetValue) {
    const trimmedText = text.trim();
    if (!trimmedText || !day) {
      return;
    }
    const nextDay = {
      ...day,
      [type]: {
        ...day[type],
        main: createTask(trimmedText, targetValue)
      }
    };
    persist(nextDay);
  }

  function addTask(type, text, targetValue) {
    const trimmedText = text.trim();
    if (!trimmedText || !day) {
      return;
    }
    const nextDay = {
      ...day,
      [type]: {
        ...day[type],
        tasks: [...day[type].tasks, createTask(trimmedText, targetValue)]
      }
    };
    persist(nextDay);
  }

  function updateMain(type, updater) {
    if (!day || !day[type].main) {
      return;
    }
    const updatedMain = updater(day[type].main);
    const nextDay = { ...day, [type]: { ...day[type], main: updatedMain } };
    persist(nextDay);
  }

  function updateTask(type, index, updater) {
    if (!day || !day[type].tasks[index]) {
      return;
    }
    const tasks = [...day[type].tasks];
    tasks[index] = updater(tasks[index]);
    const nextDay = { ...day, [type]: { ...day[type], tasks } };
    persist(nextDay);
  }

  function onDateChange(value) {
    const store = plannerStorage.getStore();
    const sortedDates = Object.keys(store).sort();
    const idx = sortedDates.indexOf(value);

    if (idx > 0 && (store[sortedDates[idx - 1]]?.reflection || '').length < 150) {
      window.alert('Finish previous reflection first.');
      return;
    }

    setSelectedDate(value);
  }

  if (!day) {
    return null;
  }

  return (
    <>
      <h1>focus.lab</h1>
      <div className="container">
        <input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} />

        <div className="grid">
          <ModuleCard
            title="WORK"
            moduleKey="work"
            data={day.work}
            ui={ui}
            setUi={setUi}
            onAddMain={addMain}
            onAddTask={addTask}
            onIncrementMain={(type) =>
              updateMain(type, (task) => {
                const count = (task.count || 0) + 1;
                return { ...task, count, done: task.target ? count >= task.target : task.done };
              })
            }
            onCompleteMain={(type) => updateMain(type, (task) => ({ ...task, done: true }))}
            onIncrementTask={(type, index) =>
              updateTask(type, index, (task) => {
                const count = (task.count || 0) + 1;
                return { ...task, count, done: task.target ? count >= task.target : task.done };
              })
            }
            onCompleteTask={(type, index) => updateTask(type, index, (task) => ({ ...task, done: true }))}
          />

          <ModuleCard
            title="LIFE"
            moduleKey="life"
            data={day.life}
            ui={ui}
            setUi={setUi}
            onAddMain={addMain}
            onAddTask={addTask}
            onIncrementMain={(type) =>
              updateMain(type, (task) => {
                const count = (task.count || 0) + 1;
                return { ...task, count, done: task.target ? count >= task.target : task.done };
              })
            }
            onCompleteMain={(type) => updateMain(type, (task) => ({ ...task, done: true }))}
            onIncrementTask={(type, index) =>
              updateTask(type, index, (task) => {
                const count = (task.count || 0) + 1;
                return { ...task, count, done: task.target ? count >= task.target : task.done };
              })
            }
            onCompleteTask={(type, index) => updateTask(type, index, (task) => ({ ...task, done: true }))}
          />

          <ReflectionCard
            reflection={day.reflection}
            onChange={(value) => {
              const nextDay = { ...day, reflection: value };
              persist(nextDay);
            }}
          />
        </div>
      </div>
    </>
  );
}

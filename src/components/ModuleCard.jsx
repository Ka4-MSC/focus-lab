import TaskItem from './TaskItem';

export default function ModuleCard({
  title,
  moduleKey,
  data,
  ui,
  setUi,
  onAddMain,
  onAddTask,
  onIncrementMain,
  onCompleteMain,
  onIncrementTask,
  onCompleteTask
}) {
  const updateUi = (next) => setUi((prev) => ({ ...prev, [moduleKey]: { ...prev[moduleKey], ...next } }));

  return (
    <div className="card">
      <div className="section-title">{title}</div>
      <div>
        {data.main ? (
          <TaskItem
            task={data.main}
            isMain
            onIncrement={() => onIncrementMain(moduleKey)}
            onComplete={() => onCompleteMain(moduleKey)}
          />
        ) : null}
      </div>
      <div>
        {data.tasks.map((task, index) => (
          <TaskItem
            key={`${task.text}-${index}`}
            task={task}
            onIncrement={() => onIncrementTask(moduleKey, index)}
            onComplete={() => onCompleteTask(moduleKey, index)}
          />
        ))}
      </div>

      <div className="card-footer">
        <button
          style={{ display: ui[moduleKey].showMain ? 'none' : 'block' }}
          onClick={() => updateUi({ showMain: true })}
        >
          ADD MAIN
        </button>

        <div className={`main-input-container ${ui[moduleKey].showMain ? 'show' : ''}`}>
          <input
            type="text"
            placeholder="Main focus"
            value={ui[moduleKey].mainText}
            onChange={(e) => updateUi({ mainText: e.target.value })}
          />
          <input
            type="number"
            placeholder="Target count (optional)"
            value={ui[moduleKey].mainTarget}
            onChange={(e) => updateUi({ mainTarget: e.target.value })}
          />
          <div>
            <button
              onClick={() => {
                onAddMain(moduleKey, ui[moduleKey].mainText, ui[moduleKey].mainTarget);
                updateUi({ showMain: false, mainText: '', mainTarget: '' });
              }}
            >
              SAVE
            </button>
            <button onClick={() => updateUi({ showMain: false, mainText: '', mainTarget: '' })}>CANCEL</button>
          </div>
        </div>

        <button
          style={{ display: ui[moduleKey].showTask ? 'none' : 'block' }}
          onClick={() => updateUi({ showTask: true })}
        >
          ADD TASK
        </button>

        <div className={`task-input-container ${ui[moduleKey].showTask ? 'show' : ''}`}>
          <input
            type="text"
            placeholder="Task name"
            value={ui[moduleKey].taskText}
            onChange={(e) => updateUi({ taskText: e.target.value })}
          />
          <input
            type="number"
            placeholder="Target count (optional)"
            value={ui[moduleKey].taskTarget}
            onChange={(e) => updateUi({ taskTarget: e.target.value })}
          />
          <div>
            <button
              onClick={() => {
                onAddTask(moduleKey, ui[moduleKey].taskText, ui[moduleKey].taskTarget);
                updateUi({ showTask: false, taskText: '', taskTarget: '' });
              }}
            >
              SAVE
            </button>
            <button onClick={() => updateUi({ showTask: false, taskText: '', taskTarget: '' })}>DELETE</button>
          </div>
        </div>
      </div>
    </div>
  );
}

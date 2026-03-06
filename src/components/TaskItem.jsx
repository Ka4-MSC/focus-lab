export default function TaskItem({ task, isMain, onIncrement, onComplete }) {
  return (
    <div className={isMain ? 'main-task task' : 'task'} style={{ width: '100%' }}>
      <span style={{ flex: 1 }} className={task.done ? 'completed' : ''}>
        {task.text}
        {task.done ? ' ✅' : ''}
      </span>

      {task.target ? (
        <>
          <span className="counter">{`${task.count || 0}/${task.target}`}</span>
          <button
            className="progress-btn"
            onClick={(event) => {
              event.stopPropagation();
              onIncrement();
            }}
          >
            +
          </button>
        </>
      ) : null}

      <button
        className="complete-btn"
        onClick={(event) => {
          event.stopPropagation();
          onComplete();
        }}
      >
        COMPLETE
      </button>
    </div>
  );
}

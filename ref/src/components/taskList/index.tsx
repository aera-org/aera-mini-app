import { Task as TaskType, TaskCategory } from '../../types/task';
import Task, { TaskSkeleton } from '../task';
import { Text } from '../../components/text';

import s from './index.module.css';
import { User } from '../../types/user';
const TasksList = ({
  loading,
  error,
  categories,
  user,
  tasks,
}: {
  loading: boolean;
  error: string | null;
  categories: TaskCategory[];
  user: User;
  tasks: TaskType[];
}) => {
  if (loading) {
    return (
      <div className={s.container}>
        <div className={s.content}>
          <div className={s.taskSection}>
            <div className={s.cards}>
              {Array(5)
                .fill(null)
                .map((_, index) => (
                  <TaskSkeleton key={index} />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className={s.error}>{error}</div>;

  return (
    <div className={s.container}>
      <div className={s.content}>
        {!tasks.length ? (
          categories.map((category) => (
            <div key={category._id} className={s.taskSection}>
              <Text variant="h2" color="white" className={s.categoryTitle}>
                {category._id}
              </Text>
              <div className={s.cards}>
                {category.tasks.map((task) => (
                  <Task
                    coin={task.reward}
                    isCompleted={task.isCompleted}
                    key={task._id}
                    task={task}
                    user={user}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={s.taskSection}>
            <div className={s.cards}>
              {tasks.map((task) => (
                <Task
                  coin={task.reward}
                  isCompleted={task.isCompleted}
                  key={task._id}
                  task={task}
                  user={user}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;

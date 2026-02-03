import { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';

import { TaskCategory } from '../../types/task';
import { PAGES } from '../../constants/page';

import { tasksApi } from '../../api/tasks';

import { useUser } from '../../context/userContext';
import { usePage } from '../../context/pageContext';

import TasksList from '../../components/taskList';
import Filter from '../../components/filter';

import s from './index.module.css';
import { logger } from '../../utils/logger';

const TasksPage = () => {
  const { user } = useUser();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filters = categories.map((el) => el._id);

  const { page } = usePage();

  const fetchTasks = useCallback(async () => {
    try {
      const { categories } = await tasksApi.getTasks();
      setCategories(categories);
    } catch (error) {
      logger.error('Failed to fetch tasks', { error: String(error) });
      setError('Failed to load tasks');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (!user) {
    return;
  }

  return (
    <div
      className={classNames(s.container, {
        isHidden: page !== PAGES.TASKS,
      })}
    >
      {categories.length ? (
        <>
          <Filter
            activeIndex={activeFilter}
            setActiveIndex={setActiveFilter}
            onClick={(index: number | null) => {
              setActiveFilter(index);
            }}
            className={s.filter || ''}
            items={filters}
          />

          <div className={s.content}>
            {activeFilter !== null ? (
              <>
                <TasksList
                  categories={[categories[activeFilter]!]}
                  user={user}
                  loading={loading}
                  error={error}
                  tasks={[]}
                />
              </>
            ) : (
              <TasksList
                categories={categories}
                user={user}
                loading={loading}
                tasks={[]}
                error={error}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TasksPage;

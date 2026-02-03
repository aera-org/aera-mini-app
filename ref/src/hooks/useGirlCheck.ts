import { useEffect } from 'react';
import { usePage } from '../context/pageContext';
import { useUser } from '../context/userContext';
import { PAGES } from '../constants/page';

export const useGirlCheck = () => {
  const { setPage } = usePage();
  const { user } = useUser();

  useEffect(() => {
    setPage((prev) => {
      if (prev === PAGES.GIRLS && user?.data.girl) {
        return PAGES.HOME_PAGE;
      }
      return prev;
    });
  }, [setPage, user]);
};

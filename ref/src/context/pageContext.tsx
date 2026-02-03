import React, { createContext, useContext, useState, useCallback } from 'react';
import { PAGES } from '../constants/page';

type PageContextType = {
  page: string;
  previousPage: string;
  setPage: (newPage: string | ((prevPage: string) => string)) => void;
  category: {
    isVisible: boolean;
    name: string | undefined;
    openedFromGuide: boolean;
  };
  setCategory: (category: {
    isVisible: boolean;
    name: string | undefined;
    openedFromGuide?: boolean;
  }) => void;
  goBack: () => void;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [page, setPageState] = useState(PAGES.GIRLS);
  const [previousPage, setPreviousPage] = useState(PAGES.GIRLS);

  // Кастомний setPage який зберігає previousPage
  const setPage = useCallback(
    (newPage: string | ((prevPage: string) => string)) => {
      setPageState((currentPage) => {
        const nextPage =
          typeof newPage === 'function' ? newPage(currentPage) : newPage;
        if (nextPage !== currentPage) {
          setPreviousPage(currentPage);
        }
        return nextPage;
      });
    },
    []
  );

  const goBack = useCallback(() => {
    setPage(previousPage);
  }, [previousPage]);

  const [category, setCategory] = useState<{
    isVisible: boolean;
    name: string | undefined;
    openedFromGuide: boolean;
  }>({
    isVisible: false,
    name: undefined,
    openedFromGuide: false,
  });

  const handleSetCategory = useCallback(
    (newCategory: {
      isVisible: boolean;
      name: string | undefined;
      openedFromGuide?: boolean;
    }) => {
      if (newCategory.isVisible) {
        setPreviousPage(page);
      }

      setCategory({
        ...newCategory,
        openedFromGuide: newCategory.openedFromGuide ?? page === PAGES.GUIDE,
      });
    },
    [page]
  );

  return (
    <PageContext.Provider
      value={{
        page,
        previousPage,
        setPage,
        category,
        setCategory: handleSetCategory,
        goBack,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};

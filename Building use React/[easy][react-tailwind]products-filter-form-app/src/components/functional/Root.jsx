/**
 * @fileoverview Компонент фильтрации продуктов
 *
 * Этот файл содержит компонент Root, который отображает список продуктов
 * с возможностью фильтрации по компании и поиска по названию или компании.
 * Компонент использует данные о продуктах из внешнего источника и позволяет
 * пользователю выбирать компанию для отображения и осуществлять поиск по продуктам.
 */

import productsData from '../../mock/mock.js';
import { useMemo, useState } from 'react';
import { ProductList, ProductsFilter } from './index.js';
import { Input } from '@ui';


/**
 * Основной компонент формы фильтрации продуктов.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий форму фильтрации продуктов.
 * @description
 * Этот компонент управляет состоянием фильтрации и поиска продуктов. Он включает в себя:
 * - Управление активной компанией для фильтрации
 * - Управление поисковым запросом
 * - Мемоизированный список компаний
 * - Мемоизированный список отфильтрованных продуктов
 * - Отображение формы поиска, списка компаний и отфильтрованного списка продуктов
 */
const Root = () => {
  // Состояние для хранения активной компании.
  const [activeCompany, setActiveCompany] = useState('all');
  // Состояние для хранения текущего поискового запроса.
  const [query, setQuery] = useState('');
  // Мемоизированный список компаний.
  const companies = useMemo(() => ['All', ...new Set(productsData.map(({ company }) => company))], []);

  /**
   * Мемоизированный список отфильтрованных продуктов.
   * @description
   * Этот useMemo хук фильтрует продукты на основе активной компании и поискового запроса.
   * Фильтрация происходит с учетом регистра (все сравнения производятся в нижнем регистре).
   *
   * Логика фильтрации:
   * 1. Преобразует поисковый запрос и активную компанию в нижний регистр.
   * 2. Фильтрует массив productsData, проверяя каждый продукт на соответствие критериям.
   * 3. Продукт проходит фильтр, если он соответствует и компании, и поисковому запросу.
   */
  const filteredProducts = useMemo(() => {
    const lowercaseQuery = query.toLowerCase();
    const lowercaseActiveCompany = activeCompany.toLowerCase();

    return productsData.filter(({ company, title }) => {
      const lowercaseCompany = company.toLowerCase();
      const lowercaseTitle = title.toLowerCase();
      const matchesCompany = lowercaseActiveCompany === 'all' || lowercaseCompany.includes(lowercaseActiveCompany);
      const matchesQuery = lowercaseTitle.includes(lowercaseQuery) || lowercaseCompany.includes(lowercaseQuery);
      return matchesCompany && matchesQuery;
    });
  }, [activeCompany, query]);

  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-4 p-3">
      <h1 className="text-center text-2xl font-bold">Products Filter</h1>
      <div className="grid items-start gap-3 xl:grid-cols-[300px_1fr]">
        <div className="grid gap-3">
          <form>
            <Input
              fullWidth={true}
              name="query"
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <h5 className="text-sm font-medium">Company</h5>
          <ProductsFilter
            companies={companies}
            setActiveCompany={setActiveCompany}
            activeCompany={activeCompany}
          />
        </div>
        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
};

export default Root;

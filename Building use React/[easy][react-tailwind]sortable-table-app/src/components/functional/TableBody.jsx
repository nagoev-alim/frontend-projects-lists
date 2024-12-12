/**
 * Компонент тела таблицы, отображающий данные пользователей.
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.data - Массив объектов с данными пользователей.
 * @returns {JSX.Element} Отрендеренное тело таблицы.
 */
const TableBody = ({ data }) => (
  <div>
    {data.map(({ id, first_name, last_name, email, gender, ip_address }) => (
      // Строка таблицы для каждого пользователя
      <div className="grid grid-cols-[70px_212px_212px_220px_180px_234px] text-sm" key={id}>
        {/* Ячейки с данными пользователя */}
        <div className="bg-white p-3 border">{id}</div>
        <div className="bg-white p-3 border">{first_name}</div>
        <div className="bg-white p-3 border">{last_name}</div>
        <div className="bg-white p-3 border break-all">{email}</div>
        <div className="bg-white p-3 border">{gender}</div>
        <div className="bg-white p-3 border">{ip_address}</div>
      </div>
    ))}
  </div>
);

export default TableBody;

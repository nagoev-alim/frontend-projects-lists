/**
 * Добавляет ведущий ноль к числу, если оно меньше 10.
 * @param {number} num - Число для форматирования.
 * @returns {string} Отформатированная строка с ведущим нулем, если необходимо.
 */
const addLeadingZero = (num) => {
  return num.toString().padStart(2, '0');
};

export default addLeadingZero;

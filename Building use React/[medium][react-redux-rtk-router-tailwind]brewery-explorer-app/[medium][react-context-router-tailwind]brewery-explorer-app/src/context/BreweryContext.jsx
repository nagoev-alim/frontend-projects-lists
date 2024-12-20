import { createContext } from 'react';
/**
 * Контекст для управления состоянием и действиями, связанными с пивоварнями.
 * 
 * @type {React.Context<null>}
 * 
 * @description
 * Этот контекст используется для передачи данных и функций, связанных с пивоварнями,
 * через дерево компонентов без необходимости передавать пропсы на каждом уровне.
 * Изначально контекст создается с значением null и должен быть заполнен
 * соответствующим провайдером.
 */
const BreweryContext = createContext(null);

export default BreweryContext;

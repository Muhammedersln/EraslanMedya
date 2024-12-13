import { createContext, useContext, useReducer } from 'react';

const AdminContext = createContext();

const adminReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    default:
      return state;
  }
};

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, {
    products: [],
    orders: [],
    users: []
  });

  return (
    <AdminContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext); 
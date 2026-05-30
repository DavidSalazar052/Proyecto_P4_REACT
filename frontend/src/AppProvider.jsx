import { createContext, useState } from 'react';

export const AppContext = createContext();

const empty = {
    puestos:   { list: [], item: { id: '', descripcion: '', salario: 0, tipo: 'PUBLICO', estado: 'ACTIVO', fecha: '' } },
    empresas:  { list: [], item: { id: '', nombre: '', localizacion: '', correo: '', telefono: '', descripcion: '' } },
    oferentes: { list: [], item: { id: '', nombre: '', apellido: '', nacionalidad: '', telefono: '', correo: '', residencia: '' } },
};

export default function AppProvider({ children }) {
    const [state, setState] = useState(empty);
    return <AppContext.Provider value={{ state, setState }}>{children}</AppContext.Provider>;
}

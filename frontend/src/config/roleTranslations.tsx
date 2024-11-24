// roleTranslations.tsx
export type Role = 'Employee' | 'Manager' | 'Admin';

const roleTranslations: Record<Role, string> = {
    Employee: 'Empleado',
    Manager: 'Gerente',
    Admin: 'Administrador',
};

const translateRole = (role: Role): string => roleTranslations[role];

export default translateRole;

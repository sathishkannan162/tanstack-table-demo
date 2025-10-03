import { faker } from "@faker-js/faker";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
};

export const generateDummyData = (): User[] => {
  return Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    department: faker.commerce.department(),
    salary: parseInt(faker.finance.amount({ min: 30000, max: 150000, dec: 0 })),
    hireDate: faker.date.past({ years: 5 }),
    isActive: faker.datatype.boolean(),
  }));
};

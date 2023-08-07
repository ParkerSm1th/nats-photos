type Show = {
  id: string;
  name: string;
  slug: string;
  location: string;
  startDate: Date;
  endDate?: Date | null;
  children?: Show[];
  createdAt: Date;
  updatedAt: Date;
};

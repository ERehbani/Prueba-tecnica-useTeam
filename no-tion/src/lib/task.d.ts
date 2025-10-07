export interface Task {
    _id?: string;
    title: string;
    tags: string[];
    description: string;
    position: number;
    responsability: string[];
    columnId: string;
    createdAt?: Date;
}

type ColumnData = Record<string, Task[]>;
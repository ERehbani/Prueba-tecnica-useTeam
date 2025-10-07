import { create } from "zustand";
import { Task } from "../lib/task";
import { User } from "@/lib/user";

interface Store {
    task: Task;
    setTask: (task: Task) => void;
}

export const useStore = create<Store>((set) => {
    const isLogged = false;
    const user: User = {
        email: "",
        access_token: "",
    }
    const task: Task = {
        title: "",
        description: "",
        columnId: "",
        tags: [],
        responsability: [],
        position: 0,
    }
    const setTask = (task: Task) => {
        set({ task });
    }
 
   
   
    return {
        task,
        setTask,
    };
});
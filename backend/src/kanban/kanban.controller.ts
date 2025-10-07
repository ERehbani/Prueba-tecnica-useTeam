import { Controller, Delete, Param } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { Get, Post } from '@nestjs/common';
import { CreateKanbanDto } from './dto/create-kanban.dto';

@Controller('kanban')
export class KanbanController {
    constructor(private readonly kanbanService: KanbanService) {}

    @Get()
    async getAllTasks() {
        return this.kanbanService.getAllTasks();
    }

    @Delete(':id')
    async deleteTask(@Param('id') taskId: string) {
        return this.kanbanService.deleteTask(taskId);
    }

    @Post()
    async createTask(taskData: CreateKanbanDto) {
        return this.kanbanService.createTask(taskData);
    }
}

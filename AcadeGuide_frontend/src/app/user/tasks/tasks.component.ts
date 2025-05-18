import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAPIService } from '../user.service';
import { Task } from './tasks.interface';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filters = ['all', 'today', 'completed'] as const;
  selectedFilter: typeof this.filters[number] = 'all';
  newTask: Task = {
    title: '',
    status: 'todo',
    priority: 'medium'
  };
  editingTask: Task | null = null;
  showAddForm = false;

  constructor(private userService: UserAPIService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.userService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  addTask() {
    this.userService.createTask(this.newTask).subscribe({
      next: (response) => {
        this.tasks.push(response);
        this.newTask = {
          title: '',
          status: 'todo',
          priority: 'medium'
        };
        this.showAddForm = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
      }
    });
  }

  updateTask(task: Task) {
    this.userService.updateTask(task.id!, task).subscribe({
      next: (response) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = response;
        }
        this.editingTask = null;
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.userService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  toggleStatus(task: Task) {
    const updatedTask: Task = {
      ...task,
      status: task.status === 'todo' ? 'completed' : 'todo'
    };
    this.updateTask(updatedTask);
  }

  startEditing(task: Task) {
    this.editingTask = { ...task };
  }

  cancelEditing() {
    this.editingTask = null;
  }

  get filteredTasks() {
    switch (this.selectedFilter) {
      case 'today':
        const today = new Date();
        return this.tasks.filter(task => 
          task.due_date && new Date(task.due_date).toDateString() === today.toDateString()
        );
      case 'completed':
        return this.tasks.filter(task => task.status === 'completed');
      default:
        return this.tasks;
    }
  }
} 
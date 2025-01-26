import { Component, computed, effect,inject,Injector, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Task} from '../../models/task.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  filter=signal<'all'|'pending'|'completed'>('all')
  tasksByFilter=computed(() =>{
    const filter=this.filter();
    const tasks=this.tasks();

    if (filter === 'pending') {
      return tasks.filter(task=>!task.completed)      
    }
    if (filter === 'completed') {
      return tasks.filter(task=>task.completed)      
    }
    return tasks
  })

  tasks=signal<Task[]>([ ]);

  newTaskCtrl= new FormControl('',{
    nonNullable:true,
    validators:[Validators.required]});

  injector=inject(Injector);

  constructor(){
   
  }

  trackTasks(){
    effect(()=>{
      const tasks=this.tasks();
      localStorage.setItem('tasks',JSON.stringify(tasks));
    },{injector:this.injector})
  }

  ngOnInit(){
    const storage=localStorage.getItem('tasks');
    if (storage) {
      const tasks=JSON.parse(storage)
      this.tasks.set(tasks)
    }
    this.trackTasks();

  }

  addTask(title:string){
    const newTask={
      id:Date.now(),
      title,
      completed:false
    }
    this.tasks.update((tasks)=>[...tasks,newTask])
  }
  changeHandler(){
    const value=this.newTaskCtrl.value
    if (this.newTaskCtrl.valid && value.trim()!='') {
      this.addTask(value)
      this.newTaskCtrl.setValue('')
    }
  }
  deleteTask(index:number){
    this.tasks.update((tasks)=>tasks.filter((task,position)=> position !== index))
  }
  updatedTask(index:number){
    this.tasks.update((tasks)=>{
      return tasks.map((task,position)=>{
        if (position ===index){
          return{
            ... task,
            completed:!task.completed
          }
        }
        return task
      })
    })
  }
  updateTaskEditinMode(index:number){
    this.tasks.update((tasks)=>{
      return tasks.map((task,position)=>{
        if (position ===index){
          return{
            ... task,
            editing:true
          }
        }
        return {
          ... task,
          editing:false
        }
      })
    })
  }
  updateTaskText(index:number,event:Event){
    const input=event.target as HTMLInputElement
    this.tasks.update((tasks)=>{
      return tasks.map((task,position)=>{
        if (position ===index){
          return{
            ... task,
            title:input.value,
            editing:false
          }
        }
        return task
      })
    })
  }
  changeFilter(filter:'all'|'pending'|'completed'){
    this.filter.set(filter)
  }
}

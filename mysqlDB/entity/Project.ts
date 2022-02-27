import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Task } from "./Task";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45 })
  ProjectName: string;

  @Column({ default: "idle", length: 10 })
  Status: string;

  @Column({ type: "datetime" })
  UpdateDate: Date;

  @Column({ type: "datetime" })
  CreateDate: Date;

  @OneToMany(() => Task, (tk) => tk.pjid)
  task: Task[];
}

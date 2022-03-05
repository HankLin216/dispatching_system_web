import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Task } from "@entities";

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

  @OneToMany(() => Task, (tk) => tk.project, { cascade: true })
  tasks: Task[];
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Project } from "@entities";
@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pjid: number;

  @Column({ length: 45 })
  TaskName: string;

  @Column({ length: 10, default: "idle" })
  Status: string;

  @Column({ length: 45, nullable: true })
  Memo?: string;

  @Column()
  UpdateDate: Date;

  @Column()
  CreateDate: Date;

  @ManyToOne(() => Project, (pj) => pj.tasks)
  @JoinColumn({ name: "pjid" })
  project: Project;
}

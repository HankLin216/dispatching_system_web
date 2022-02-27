import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Project } from "./Project";

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (proj) => proj.id)
  pjid: number;

  @Column({ length: 45 })
  TaskName: string;

  @Column({ length: 10, default: "idle" })
  Status: string;

  @Column({ length: 45, nullable: true })
  Memo: string | null;

  @Column()
  UpdateDate: Date;

  @Column()
  CreateDate: Date;
}

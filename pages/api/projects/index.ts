import type { NextApiRequest, NextApiResponse } from "next";
import { Project, Task } from "@entities";
import { prepareConnection } from "@mysql/db";
import { PostData } from "@modules/api/Project";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | string | Project[]>,
) {
  try {
    let conn = null;
    switch (req.method?.toUpperCase()) {
      case "GET":
        conn = await prepareConnection();
        let projectRepository = conn.getRepository(Project);
        let PjList = await projectRepository
          .createQueryBuilder("project")
          .leftJoinAndSelect("project.tasks", "task")
          .getMany();

        res.status(200).json(PjList);
        break;
      case "POST":
        conn = await prepareConnection();
        const data: PostData = JSON.parse(req.body);

        let newPj = new Project();
        newPj.ProjectName = data.ProjectName;
        newPj.CreateDate = new Date();
        newPj.UpdateDate = new Date();

        let tkList: Task[] = data.TaskNameList.map((tkName) => {
          let newTk = new Task();
          newTk.TaskName = tkName;
          newTk.CreateDate = new Date();
          newTk.UpdateDate = new Date();
          return newTk;
        });

        newPj.tasks = tkList;
        await conn.getRepository(Project).save(newPj);

        res.status(200).json(true);

        break;
      default:
        res.status(405).json("Unknow method!");
        break;
    }
  } catch (err) {
    var err_message = (err as { message: string }).message;
    res.status(500).json(err_message);
  }
}

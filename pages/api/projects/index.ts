import type { NextApiRequest, NextApiResponse } from "next";
import { Project } from "@mysql/entity/Project";
import { Task } from "@mysql/entity/Task";
import { prepareConnection } from "@mysql/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse<boolean | string>) {
  switch (req.method?.toUpperCase()) {
    case "GET":
      try {
        var conn = await prepareConnection();

        var _tk = new Task();
        _tk.TaskName = "TK_Test";
        _tk.CreateDate = new Date();
        _tk.UpdateDate = new Date();
        var t = await conn.getRepository(Task).save(_tk);

        var _pj = new Project();
        _pj.ProjectName = "test";
        _pj.CreateDate = new Date();
        _pj.UpdateDate = new Date();
        _pj.task = [_tk];
        var c = await conn.getRepository(Project).save(_pj);
      } catch (err) {
        var a = (err as { message: string }).message;
        var b = 1;
        res.status(405).json(a);
        break;
      }
      res.status(200).json(true);
      break;
    default:
      res.status(405).json("Unknow method!");
      break;
  }
}

import { Task } from "@modules/mysql";
import config from "lib/config";
import { Response } from "@modules/api/Project";
import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export async function GetTaskListByProjectID(projectID: number): Promise<Task[]> {
  let conn = await mysql.createConnection(config.mysqlConfig);
  const [rows, _] = await conn.execute("Select * from tasks where pjid = ?", [projectID]);
  return rows as Task[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Task[] | Response>,
) {
  try {
    switch (req.method?.toUpperCase()) {
      case "GET":
        let { ID, ProjectID } = req.query;
        let taskList: Task[] = [];
        // get by project id
        if (ID === undefined && ProjectID !== undefined) {
          taskList = await GetTaskListByProjectID(parseInt(ProjectID as string, 10));
        }
        res.status(200).json(taskList);
        break;
      default:
        res.status(405).json({ result: false, message: "Unknow method!" });
        break;
    }
  } catch (err) {
    var err_message = (err as { message: string }).message;
    res.status(500).json({ result: false, message: err_message });
  }
}

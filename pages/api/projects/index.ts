import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";
import { PostData, QueryLastInsertID, Response } from "@modules/api/Project";
import { Project } from "@modules/mysql";
import config from "lib/config";

export async function GetProjectList(): Promise<Project[]> {
  let conn = await mysql.createConnection(config.mysqlConfig);
  const [rows, _] = await conn.execute("Select * from projects");

  return rows as Project[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response | Project[]>,
) {
  try {
    let conn = null;
    switch (req.method?.toUpperCase()) {
      case "GET":
        let PjList = await GetProjectList();
        res.status(200).json(PjList);
        break;
      case "POST":
        const data: PostData = JSON.parse(req.body);
        let conn = await mysql.createConnection(config.mysqlConfig);

        let DateNow = new Date();

        // db transaction
        await conn.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        await conn.beginTransaction();
        try {
          // add project
          await conn.execute(
            "insert into DispatchingSystem.projects (ProjectName, UpdateDate, CreateDate) values  (?, ?, ?);",
            [data.ProjectName, DateNow, DateNow],
          );
          // get the last inset ID
          let [result] = await conn.query<QueryLastInsertID[]>("Select LAST_INSERT_ID();");
          let lastInsertPJID: number = result[0]["LAST_INSERT_ID()"];
          // add tasks
          let addTaskInfo = data.TaskNameList.map((r) => [lastInsertPJID, r]);
          await conn.execute(
            "insert into DispatchingSystem.tasks (pjid, TaskName) values ?",
            addTaskInfo,
          );
          await conn.commit();
          res.status(200).json({ result: true, insertProjectID: lastInsertPJID });
        } catch (err) {
          conn.rollback();
          throw err;
        }
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

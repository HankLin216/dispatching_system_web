import { RowDataPacket } from "mysql2";

export interface PostData {
  ProjectName: string;
  TaskNameList: string[];
}

export interface Response {
  result: boolean;
  insertProjectID?: number;
  message?: string;
}

export interface QueryLastInsertID extends RowDataPacket {
  "LAST_INSERT_ID()": number;
}

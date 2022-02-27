import RedisProvider from "../../../lib/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import type { SampleInfo } from "../../../modules/@sample";

export default async function handler(req: NextApiRequest, res: NextApiResponse<SampleInfo[]>) {
  var redis = RedisProvider.getRedisInstance();
  var allSampleKeys = await redis.keys("*");

  var sampleInfoPromises = allSampleKeys.map((r) =>
    redis.hgetall(r).then((s) => {
      var sampleInfo: SampleInfo = {
        ID: parseInt(s.ID, 10),
        ProjectID: parseInt(s.ProjectID, 10),
        TaskID: parseInt(s.TaskID, 10),
        Status: s.Status,
        UpdateTime: s.UpdateTime,
      };
      return sampleInfo;
    }),
  );
  var sampleInfos = await Promise.all(sampleInfoPromises);

  res.status(200).json(sampleInfos);
}

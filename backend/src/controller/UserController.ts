import { Request, Response } from "express";
import prisma from "../db/prisma.ts";

export const users = async (req: Request, res: Response) => {
  const data = await prisma.user.findMany();

  res.status(200).send({data});
}
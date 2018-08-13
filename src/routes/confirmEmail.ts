import { Request, Response } from "express";

import db from "../knex";
import { redis } from "../redis";
import extractUserIdFromConfirmEmailKey from "../modules/user/shared/logic/extractUserIdFromConfirmEmailKey";
import deleteConfirmEmailLink from "../modules/user/shared/logic/deleteConfirmEmailLink";

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await extractUserIdFromConfirmEmailKey(id, redis);
  if (userId) {
    await db("users")
      .update({ confirmed: true })
      .where({ id: userId });
    await deleteConfirmEmailLink(id, redis);
    // res.send(
    //   `Your email has been confirmed. Please log in to ${
    //     process.env.FRONTEND_HOST
    //   } to continue`
    // );
    res.redirect(`${process.env.FRONTEND_HOST}/confirmed`);
  } else {
    res.send("invalid");
  }
};

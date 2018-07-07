import { Request, Response } from "express";

import User from "../models/User";

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await User.extractUserIdFromConfirmEmailKey(id);
  if (userId) {
    await User.query()
      .update({ confirmed: true })
      .where({ id: userId });
    await User.deleteConfirmEmailLink(id);
    res.send("ok");
  } else {
    res.send("invalid");
  }
};

import { Model } from "objection";
import * as bcrypt from "bcryptjs";
import db from "../knex";
import { redis } from "../redis";
import * as jwt from "jsonwebtoken";
import { v4 } from "uuid";

import { userTokenVersionPrefix, forgotPasswordPrefix } from "../constants";
Model.knex(db);

// TODO - Send forgot pass email
// TODO - Should I pull yup validation stuff in here?

export default class User extends Model {
  static tableName = "users";
  static idColumn = "id";
  static async invalidateUserTokens(userId: string) {
    if (!userId) {
      return null;
    }
    return redis.incr(`${userTokenVersionPrefix}${userId}`);
  }

  static async extractUserIdFromForgotPassKey(key: string) {
    const redisKey = `${forgotPasswordPrefix}${key}`;
    return redis.get(redisKey);
  }

  static async deleteForgotPassKey(key: string) {
    const redisKey = `${forgotPasswordPrefix}${key}`;
    return redis.del(redisKey);
  }

  static async extractUserIdFromConfirmEmailKey(id: string) {
    return redis.get(id);
  }

  static async createConfirmEmailLink(url: string, userId: string) {
    const id = v4();
    await redis.set(id, userId, "ex", 60 * 60 * 24);
    return `${url}/confirm/${id}`;
  }

  static async deleteConfirmEmailLink(id: string) {
    return redis.del(id);
  }

  static async createForgotPasswordLink(userId: string) {
    const id = v4();
    const url = process.env.FRONTEND_HOST as string;
    await redis.set(`${forgotPasswordPrefix}${id}`, userId, "ex", 60 * 20);
    return `${url}/change-password/${id}`;
  }

  id: string;
  email: string;
  confirmed: boolean;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;

  async verifyPassword(password: string) {
    return bcrypt.compare(password, this.password);
  }

  async getCurrentValidTokenVersion(): Promise<string> {
    let tokenVersion = await redis.get(`${userTokenVersionPrefix}${this.id}`);

    if (!tokenVersion) {
      await redis.set(`${userTokenVersionPrefix}${this.id}`, 1);
      tokenVersion = "1";
    }
    return tokenVersion;
  }

  async generateToken(): Promise<string> {
    return jwt.sign(
      {
        id: this.id,
        version: parseInt(await this.validTokenVersion, 10)
      },
      process.env.JWT_SECRET as any,
      { expiresIn: "24h" }
    );
  }

  get validTokenVersion(): Promise<string> {
    return this.getCurrentValidTokenVersion();
  }

  get loginToken(): Promise<string> {
    return this.generateToken();
  }

  async $beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.password = await bcrypt.hash(this.password, 10);
  }

  async $beforeUpdate() {
    this.updatedAt = new Date();
    // change password
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}

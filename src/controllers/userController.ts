import { UserService } from "../services/userService";
import type { Request, Response } from "express";
import { User } from "../database/modelsTypes";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshAccessToken,
} from "../utils/jwtToken";
import { TokenUserPayload, TokenData } from "../utils/types";
import jwt from "jsonwebtoken";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const { rows, count } = await UserService.getUsers(req.query);
      res.json({
        success: true,
        data: {
          users: rows,
          totalCount: count,
        },
        message: "List of users fetch successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user: User = await UserService.createUser(req.body);
      res.json({
        success: true,
        user: user,
        message: "User is created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const user: User = await UserService.getUserById(id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User doesn't exists",
        });
      }
      await UserService.deleteUser(id);
      res.json({
        success: true,
        message: "User is deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const user: User = await UserService.getUserById(id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User doesn't exists",
        });
      }
      const updatedUser: User = await UserService.updateUser(id, req.body);
      res.json({
        success: true,
        data: {
          user: updatedUser,
        },
        message: "User is updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async loginUser(req, res) {
    try {
      const password: string = req.body.password;
      const username: string = req.body.username;

      const user: User = await UserService.getUserByUsername(username);

      if (user == null) {
        return res.status(400).json({
          success: false,
          message: "Username or password are not correct",
        });
      }

      if (await bcrypt.compare(password, user.password)) {
        const userTokenData: TokenUserPayload = {
          uuid: user.uuid,
          role: user.role,
        };
        const accessToken = generateAccessToken(userTokenData);
        const refreshToken = generateRefreshAccessToken(userTokenData);
        res.json({
          success: true,
          accessToken,
          refreshToken,
          message: "User login successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Username or password are not correct",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      if (!req.body.refreshToken) {
        throw new Error("refreshToken missing");
      }

      jwt.verify(
        req.body.refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err: any, userTokenData: TokenData) => {
          if (err) {
            return res.sendStatus(401)
          }

          const tokenUserPayload: TokenUserPayload = {
            uuid: userTokenData.uuid,
            role: userTokenData.role
          }

          // if refresh token is valid create new token and refresh token
          const accessToken: string = generateAccessToken(tokenUserPayload);
          const refreshToken: string = generateRefreshAccessToken(tokenUserPayload);
          res.json({
            success: true,
            accessToken,
            refreshToken,
            message: "Token refreshed successfully",
          });
        }
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

import jwt from 'jsonwebtoken';
import { TokenUserPayload } from './types';

export const generateAccessToken = (user: TokenUserPayload) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' }); // TODO change to 15m
}

export const generateRefreshAccessToken = (user: TokenUserPayload) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}
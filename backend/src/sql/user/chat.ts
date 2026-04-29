import pool from "../../config/db";
import { getUserChatIds as getUserChatIdsSql } from "./chat.sql";

export const getUserChatIds = async (userId: number): Promise<number[]> => {
  const [rows]: any = await pool.query(
    getUserChatIdsSql,
    [userId]
  );
  // Returns an array of IDs like [1, 4, 12]
  return rows.map((row: any) => row.chat_id);
};
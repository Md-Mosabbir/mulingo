import pool from "../../config/db";
import { searchUserSql } from "./search.sql";

export const searchUsers = async (query: string, myId: number) => {
  const searchTerm = `%${query}%`; // Add the wildcards here
  
  const [rows] = await pool.query(
    searchUserSql, 
    [searchTerm, searchTerm, searchTerm, myId] // Pass the same term 3 times
  );

  return rows;
};
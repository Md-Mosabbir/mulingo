import { Request, Response } from "express"
import pool from "../config/db"
import { searchUserSql } from "../sql/user/search.sql"
import { searchUsers } from "../sql/user/search"


export const searchUser = async (req: Request, res: Response) => {

    try{
        const username = req.query.username as string
  

        if(!username) return res.status(400).json({message: "Username is required"})

        const users = await searchUsers(username, (req as any).user.id)
        console.log((req as any).user)


        res.json(users)
        




    } catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}
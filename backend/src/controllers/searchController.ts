import { Request, Response } from "express"
import { searchUsers } from "../sql/user/search"
import { fail, ok } from "../utils/response"


export const searchUser = async (req: Request, res: Response) => {

    try{
        const username = req.query.username as string
  

        if(!username) return fail(res, "Username is required", 400)

        const users = await searchUsers(username, (req as any).user.id)
        return ok(res, users)
        




    } catch(error){
        console.log(error)
        return fail(res, "Internal server error", 500)
    }
}
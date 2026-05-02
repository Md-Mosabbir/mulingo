import { Request, Response } from "express";
import pool from "../config/db";

export const createPrivateRoom= async (req: Request, res: Response) => {

    const { user1_id, user2_id } = req.body;

    if (!user1_id || !user2_id) {
        return res.status(400).json({ message: "user1_id and user2_id are required" });
    }

const getExistingchats = `
SELECT c.chat_id
FROM chats c
JOIN chat_members cm1 ON c.chat_id = cm1.chat_id
JOIN chat_members cm2 ON c.chat_id = cm2.chat_id
WHERE c.chat_type = 'private'
  AND cm1.user_id = ?
  AND cm2.user_id = ?
LIMIT 1
`

    try{
//TODO: change type
        const [existingChats]: any =  await pool.query(getExistingchats, [user1_id, user2_id])

        if(existingChats.length > 0){

                return res.status(200).json({
                  message: "Private chat already exists",
                  chat_id: existingChats[0].chat_id,
                });
        }


  // Create new private chat
  const [chatResult]: any = await pool.query(
    `
    INSERT INTO chats (chat_type, created_by)
    VALUES ('private', ?)
    `,
    [user1_id]
  );

  const chat_id = chatResult.insertId;

  // Add both users to chat_members
  await pool.query(
    `
    INSERT INTO chat_members (chat_id, user_id, member_role)
    VALUES (?, ?, 'owner'), (?, ?, 'member')
    `,
    [chat_id, user1_id, chat_id, user2_id]
  );
        res.status(201).json({message: "Hello"})




    } catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }











}
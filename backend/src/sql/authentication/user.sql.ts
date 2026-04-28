export const userSql = {
  getLanguages:'SELECT * FROM languages JOIN users ON languages.language_id = users.preferred_language_id',
  languageUpdate: 'UPDATE users SET preferred_language_id = ? WHERE user_id = ?',
  ChatHistory: 'SELECT chat_name, original_text, translated_text, sent_at FROM messages JOIN user ON messages.sender_id = user.user_id JOIN chat_members ON user.user_id = chat_members.user_id JOIN chats ON chat_member.chat_id = chats.chat_id WHERE messages.sender_id = ? AND chat_member.user_id = ?',

};
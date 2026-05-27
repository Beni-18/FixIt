class CreateChatSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :chat_sessions do |t|
      t.bigint  :user_id, null: false
      t.jsonb   :messages, null: false, default: []
      t.string  :status,   null: false, default: "active"
      t.timestamps null: false
    end

    add_index :chat_sessions, :user_id
    add_index :chat_sessions, :messages, using: :gin
    add_foreign_key :chat_sessions, :users, on_delete: :cascade
  end
end

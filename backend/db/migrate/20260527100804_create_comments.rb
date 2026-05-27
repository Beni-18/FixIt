class CreateComments < ActiveRecord::Migration[7.2]
  def change
    create_table :comments do |t|
      t.bigint :issue_id, null: false
      t.bigint :user_id,  null: false
      t.text   :content,  null: false
      t.timestamps null: false
    end

    add_index :comments, :issue_id
    add_index :comments, :user_id
    add_foreign_key :comments, :issues, on_delete: :cascade
    add_foreign_key :comments, :users, on_delete: :cascade
  end
end

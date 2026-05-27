class CreateUpvotes < ActiveRecord::Migration[7.2]
  def change
    # No surrogate PK — composite PK prevents double-voting
    create_table :upvotes, id: false do |t|
      t.bigint :user_id,  null: false
      t.bigint :issue_id, null: false
      t.datetime :created_at, null: false
    end

    execute "ALTER TABLE upvotes ADD PRIMARY KEY (user_id, issue_id);"

    add_index :upvotes, :issue_id
    add_foreign_key :upvotes, :users,  column: :user_id,  on_delete: :cascade
    add_foreign_key :upvotes, :issues, column: :issue_id, on_delete: :cascade
  end
end

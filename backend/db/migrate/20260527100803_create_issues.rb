class CreateIssues < ActiveRecord::Migration[7.2]
  def change
    create_table :issues do |t|
      t.bigint  :user_id,        null: false
      t.string  :title,          null: false
      t.text    :description,    null: false
      t.string  :location,       null: false
      t.string  :category,       null: false
      t.string  :status,         null: false, default: "raised"
      t.integer :upvotes_count,  null: false, default: 0
      t.integer :priority_score, null: false, default: 0
      t.timestamps null: false
    end

    add_index :issues, :user_id
    add_index :issues, :status
    add_index :issues, :category
    add_index :issues, [:upvotes_count, :created_at]
    add_foreign_key :issues, :users, on_delete: :restrict

    execute <<~SQL
      ALTER TABLE issues
        ADD CONSTRAINT issues_status_check
        CHECK (status IN ('raised', 'processed', 'being_resolved', 'resolved'));
    SQL
  end
end

class CreateIssueStatusLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :issue_status_logs do |t|
      t.bigint :issue_id,      null: false
      t.bigint :changed_by_id, null: false
      t.string :from_status,   null: false
      t.string :to_status,     null: false
      t.text   :note
      t.timestamps null: false
    end

    add_index :issue_status_logs, :issue_id
    add_index :issue_status_logs, :changed_by_id
    add_foreign_key :issue_status_logs, :issues, column: :issue_id,      on_delete: :cascade
    add_foreign_key :issue_status_logs, :users,  column: :changed_by_id, on_delete: :cascade
  end
end

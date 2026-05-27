class CreateStaffAssignments < ActiveRecord::Migration[7.2]
  def change
    create_table :staff_assignments do |t|
      t.bigint :issue_id,      null: false
      t.bigint :staff_id,      null: false
      t.bigint :assigned_by_id, null: false
      t.text   :note
      t.timestamps null: false
    end

    add_index :staff_assignments, :issue_id
    add_index :staff_assignments, :staff_id
    add_foreign_key :staff_assignments, :issues, column: :issue_id,       on_delete: :cascade
    add_foreign_key :staff_assignments, :users,  column: :staff_id,       on_delete: :restrict
    add_foreign_key :staff_assignments, :users,  column: :assigned_by_id, on_delete: :restrict
  end
end

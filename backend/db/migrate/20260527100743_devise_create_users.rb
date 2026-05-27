# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at

      # Profile
      t.string :name,       null: false, default: ""
      t.string :student_id
      t.string :role,       null: false, default: "student"
      t.string :phone
      t.string :department
      t.boolean :verified,  null: false, default: false
      t.boolean :active,    null: false, default: true

      # JWT denylist reference
      t.string :jti, null: false

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :jti,                  unique: true
    add_index :users, :role
  end
end

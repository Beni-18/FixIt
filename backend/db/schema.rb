# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_27_101003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "chat_sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.jsonb "messages", default: [], null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["messages"], name: "index_chat_sessions_on_messages", using: :gin
    t.index ["user_id"], name: "index_chat_sessions_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "issue_id", null: false
    t.bigint "user_id", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["issue_id"], name: "index_comments_on_issue_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "issue_status_logs", force: :cascade do |t|
    t.bigint "issue_id", null: false
    t.bigint "changed_by_id", null: false
    t.string "from_status", null: false
    t.string "to_status", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["changed_by_id"], name: "index_issue_status_logs_on_changed_by_id"
    t.index ["issue_id"], name: "index_issue_status_logs_on_issue_id"
  end

  create_table "issues", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.string "location", null: false
    t.string "category", null: false
    t.string "status", default: "raised", null: false
    t.integer "upvotes_count", default: 0, null: false
    t.integer "priority_score", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_issues_on_category"
    t.index ["status"], name: "index_issues_on_status"
    t.index ["upvotes_count", "created_at"], name: "index_issues_on_upvotes_count_and_created_at"
    t.index ["user_id"], name: "index_issues_on_user_id"
    t.check_constraint "status::text = ANY (ARRAY['raised'::character varying, 'processed'::character varying, 'being_resolved'::character varying, 'resolved'::character varying]::text[])", name: "issues_status_check"
  end

  create_table "staff_assignments", force: :cascade do |t|
    t.bigint "issue_id", null: false
    t.bigint "staff_id", null: false
    t.bigint "assigned_by_id", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["issue_id"], name: "index_staff_assignments_on_issue_id"
    t.index ["staff_id"], name: "index_staff_assignments_on_staff_id"
  end

  create_table "upvotes", primary_key: ["user_id", "issue_id"], force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "issue_id", null: false
    t.datetime "created_at", null: false
    t.index ["issue_id"], name: "index_upvotes_on_issue_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name", default: "", null: false
    t.string "student_id"
    t.string "role", default: "student", null: false
    t.string "phone"
    t.string "department"
    t.boolean "verified", default: false, null: false
    t.boolean "active", default: true, null: false
    t.string "jti", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "chat_sessions", "users", on_delete: :cascade
  add_foreign_key "comments", "issues", on_delete: :cascade
  add_foreign_key "comments", "users", on_delete: :cascade
  add_foreign_key "issue_status_logs", "issues", on_delete: :cascade
  add_foreign_key "issue_status_logs", "users", column: "changed_by_id", on_delete: :cascade
  add_foreign_key "issues", "users", on_delete: :restrict
  add_foreign_key "staff_assignments", "issues", on_delete: :cascade
  add_foreign_key "staff_assignments", "users", column: "assigned_by_id", on_delete: :restrict
  add_foreign_key "staff_assignments", "users", column: "staff_id", on_delete: :restrict
  add_foreign_key "upvotes", "issues", on_delete: :cascade
  add_foreign_key "upvotes", "users", on_delete: :cascade
end

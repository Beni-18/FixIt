class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :email, :role, :student_id, :phone, :department,
         :verified, :active, :created_at

  view :public do
    fields :name, :role, :department
  end

  view :profile do
    fields :name, :email, :role, :student_id, :phone, :department,
           :verified, :active, :created_at
    field :id_card_url do |user, opts|
      if user.id_card_image.attached? && opts[:url_helpers] && opts[:base_url]
        opts[:url_helpers].rails_blob_url(user.id_card_image.blob, host: opts[:base_url])
      end
    end
    field :issues_count do |user|
      user.issues.count
    end
    field :upvotes_given_count do |user|
      user.upvotes.count
    end
  end

  view :admin do
    include_view :profile
    fields :name, :email, :role, :student_id, :verified, :active, :created_at
  end
end

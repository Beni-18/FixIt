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
      opts[:url_helpers]&.url_for(user.id_card_image) if user.id_card_image.attached?
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

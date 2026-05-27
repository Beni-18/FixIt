class IssueBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :location, :category,
         :status, :upvotes_count, :priority_score, :created_at, :updated_at

  field :status_color do |issue|
    issue.status_color
  end

  field :hot do |issue|
    issue.hot?
  end

  field :photo_url do |issue, opts|
    opts[:url_helpers]&.url_for(issue.photo) if issue.photo.attached?
  end

  association :user, blueprint: UserBlueprint, view: :public

  view :feed do
    fields :title, :location, :category, :status, :upvotes_count, :created_at
    field :status_color do |issue|
      issue.status_color
    end
    field :hot do |issue|
      issue.hot?
    end
    field :comments_count do |issue|
      issue.comments.count
    end
    field :user_voted do |issue, opts|
      current_user = opts[:current_user]
      current_user ? issue.upvoted_by?(current_user) : false
    end
    association :user, blueprint: UserBlueprint, view: :public
  end

  view :detail do
    include_view :feed
    fields :description
    field :next_status do |issue|
      issue.next_status
    end
    association :comments, blueprint: -> { CommentBlueprint }
    association :issue_status_logs, blueprint: -> { IssueStatusLogBlueprint }
    association :staff_assignments, blueprint: -> { StaffAssignmentBlueprint }
  end
end

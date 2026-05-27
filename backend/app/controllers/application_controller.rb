class ApplicationController < ActionController::API
  include Pundit::Authorization

  before_action :authenticate_user!

  rescue_from Pundit::NotAuthorizedError,  with: :unauthorized
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  private

  def unauthorized(e)
    render json: { error: e.message || "Not authorized" }, status: :forbidden
  end

  def not_found(e)
    render json: { error: e.message || "Not found" }, status: :not_found
  end

  def pagination_meta(collection)
    {
      current_page:  collection.current_page,
      total_pages:   collection.total_pages,
      total_entries: collection.total_entries,
      per_page:      collection.per_page
    }
  end

  def url_helpers
    Rails.application.routes.url_helpers
  end
end

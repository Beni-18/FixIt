class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    raise Pundit::NotAuthorizedError, "must be logged in" unless user
    @user   = user
    @record = record
  end

  def index?  = false
  def show?   = false
  def create? = false
  def update? = false
  def destroy? = false

  def admin? = user.admin?
  def staff? = user.staff?
  def student? = user.student?
  def owner? = record.respond_to?(:user_id) && record.user_id == user.id
end

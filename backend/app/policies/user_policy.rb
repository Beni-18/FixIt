class UserPolicy < ApplicationPolicy
  def index?  = admin?
  def show?   = admin? || record.id == user.id
  def update? = record.id == user.id
  def destroy? = admin?
  def verify? = admin?
end

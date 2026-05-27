class IssuePolicy < ApplicationPolicy
  def index?  = true
  def show?   = true
  def create? = user.active?
  def update? = owner? || admin?
  def destroy? = owner? || admin?

  def advance_status? = admin?
  def assign_staff?   = admin?
end

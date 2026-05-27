class CommentPolicy < ApplicationPolicy
  def index?  = true
  def show?   = true
  def create? = user.active?
  def update? = owner?
  def destroy? = owner? || admin?
end

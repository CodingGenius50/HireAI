from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsRecruiterOwnerOrReadOnly(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return request.user.role == "RECRUITER"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return obj.company.recruiter_id == request.user.id
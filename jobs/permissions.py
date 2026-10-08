from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsRecruiterOwnerOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        # Anyone can view jobs
        if request.method in SAFE_METHODS:
            return True

        # Only authenticated recruiters can create/update/delete
        return (
            request.user.is_authenticated
            and request.user.role == "RECRUITER"
        )

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        # Anyone can view job details
        if request.method in SAFE_METHODS:
            return True

        # User must be authenticated recruiter
        if not request.user.is_authenticated:
            return False

        if request.user.role != "RECRUITER":
            return False

        # Recruiter can modify only their own company's jobs
        return obj.company.recruiter == request.user
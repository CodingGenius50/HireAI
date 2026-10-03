from rest_framework.permissions import BasePermission
from .models import Application


class IsApplicantOrJobOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        if obj.applicant == request.user:
            return True

        if obj.job.company.recruiter == request.user:
            return True

        return False
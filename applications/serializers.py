from rest_framework import serializers

from .models import (
    Application,
    Interview,
)


# =========================================================
# APPLICATION SERIALIZER
# =========================================================

class ApplicationSerializer(
    serializers.ModelSerializer
):

    applicant_name = serializers.ReadOnlyField(
        source="applicant.username"
    )

    job_title = serializers.ReadOnlyField(
        source="job.title"
    )

    class Meta:

        model = Application

        fields = [
            "id",
            "job",
            "job_title",
            "applicant_name",
            "cover_letter",
            "cv_score",
            "match_score",
            "overall_score",
            "status",
            "applied_at",
        ]

        read_only_fields = [
            "id",
            "applicant_name",
            "job_title",
            "cv_score",
            "match_score",
            "overall_score",
            "status",
            "applied_at",
        ]


# =========================================================
# APPLICATION STATUS SERIALIZER
# =========================================================

class ApplicationStatusSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Application

        fields = [
            "status"
        ]


# =========================================================
# INTERVIEW SERIALIZER
# =========================================================

class InterviewSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Interview

        fields = [
            "id",
            "application",
            "questions",
            "answers",
            "interview_score",
            "feedback",
            "created_at",
            "completed_at",
        ]

        read_only_fields = [
            "id",
            "application",
            "questions",
            "interview_score",
            "feedback",
            "created_at",
            "completed_at",
        ]
from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.ReadOnlyField(source="applicant.username")
    job_title = serializers.ReadOnlyField(source="job.title")

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_title",
            "applicant_name",
            "cover_letter",
            "status",
            "applied_at",
        ]
        read_only_fields = [
            "id",
            "applicant_name",
            "job_title",
            "status",
            "applied_at",
        ]
        
class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]
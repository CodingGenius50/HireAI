from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source="company.name")

    class Meta:
        model = Job
        fields = [
            "id",
            "company",
            "company_name",
            "title",
            "description",
            "skills",
            "salary_min",
            "salary_max",
            "location",
            "job_type",
            "deadline",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "company",
            "company_name",
            "created_at",
        ]
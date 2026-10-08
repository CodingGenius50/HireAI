from rest_framework import serializers
from .models import CV


class CVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = [
            "id",
            "name",
            "email",
            "education",
            "skills",
            "experience",
            "file",
            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "uploaded_at",
        ]

    def validate_file(self, value):
        if value is None:
            return value

        allowed_extensions = [".pdf", ".docx"]

        if not any(
            value.name.lower().endswith(ext)
            for ext in allowed_extensions
        ):
            raise serializers.ValidationError(
                "Only PDF and DOCX files are allowed."
            )

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "File size must be less than 5 MB."
            )

        return value
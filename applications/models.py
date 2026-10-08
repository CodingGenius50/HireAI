from django.db import models
from django.conf import settings
from jobs.models import Job


class Application(models.Model):

    STATUS_CHOICES = [
        ("APPLIED", "Applied"),
        ("INTERVIEW_QUALIFIED", "Interview Qualified"),
        ("SHORTLISTED", "Shortlisted"),
        ("REJECTED", "Rejected"),
        ("HIRED", "Hired"),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    cover_letter = models.TextField(
        blank=True
    )

    cv_score = models.FloatField(
        null=True,
        blank=True
    )

    match_score = models.FloatField(
        null=True,
        blank=True
    )

    overall_score = models.FloatField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="APPLIED"
    )

    applied_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.applicant.username} - "
            f"{self.job.title}"
        )


class Interview(models.Model):

    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name="interview"
    )

    questions = models.JSONField(
        default=list
    )

    answers = models.JSONField(
        default=list
    )

    interview_score = models.FloatField(
        null=True,
        blank=True
    )

    feedback = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return (
            f"Interview - "
            f"{self.application.applicant.username} - "
            f"{self.application.job.title}"
        )
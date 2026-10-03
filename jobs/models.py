from django.db import models
from companies.models import Company


class Job(models.Model):
    JOB_TYPES = [
        ("FULL_TIME", "Full Time"),
        ("PART_TIME", "Part Time"),
        ("INTERNSHIP", "Internship"),
        ("REMOTE", "Remote"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="jobs"
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    skills = models.TextField()
    salary_min = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    salary_max = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES)
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
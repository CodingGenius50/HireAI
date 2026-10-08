from django.urls import path


from .views import (
    ApplicationCreateView,
    MyApplicationListView,
    ApplicationStatusUpdateView,
    RecruiterApplicationListView,
    GenerateInterviewQuestionsView,
    SubmitInterviewAnswersView,
)
urlpatterns = [

    # Apply to job
    path(
        "apply/",
        ApplicationCreateView.as_view(),
        name="application-create",
    ),

    # Candidate applications
    path(
        "my/",
        MyApplicationListView.as_view(),
        name="my-applications",
    ),

    # Recruiter application status update
    path(
        "<int:pk>/status/",
        ApplicationStatusUpdateView.as_view(),
        name="application-status",
    ),

    # Recruiter applications
    path(
        "recruiter/",
        RecruiterApplicationListView.as_view(),
        name="recruiter-applications",
    ),

    # Generate AI interview
    path(
        "interview/generate/",
        GenerateInterviewQuestionsView.as_view(),
        name="generate-interview",
    ),
    path(
    "interview/submit/",
    SubmitInterviewAnswersView.as_view(),
    name="submit-interview",
),
]
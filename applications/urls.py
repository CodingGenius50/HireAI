from django.urls import path

from .views import (
    ApplicationCreateView,
    MyApplicationListView,
    ApplicationStatusUpdateView,
    RecruiterApplicationListView,
)

urlpatterns = [
    path("", ApplicationCreateView.as_view(), name="application-create"),
    path("my/", MyApplicationListView.as_view(), name="my-applications"),
    path(
        "<int:pk>/status/",
        ApplicationStatusUpdateView.as_view(),
        name="application-status-update",
    ),
    path(
    "recruiter/",
    RecruiterApplicationListView.as_view(),
    name="recruiter-applications",
),
]
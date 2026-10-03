from django.urls import path

from .views import (
    CVView,
    CVTextExtractView,
    CVAnalyzeView,
    CVScoreView,
    CVJobMatchView,
)

urlpatterns = [
    path("cvcheck/", CVView.as_view(), name="cv"),
    path("extract/", CVTextExtractView.as_view(), name="cv-extract"),
    path("analyze/", CVAnalyzeView.as_view(), name="cv-analyze"),
    path("score/", CVScoreView.as_view(), name="cv-score"),
    path("match/", CVJobMatchView.as_view(), name="cv-job-match"),
]
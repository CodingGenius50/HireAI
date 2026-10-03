from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import ApplicationSerializer,ApplicationStatusSerializer


class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class MyApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).order_by("-applied_at")
        
from rest_framework import generics
from .permissions import IsApplicantOrJobOwner


class ApplicationStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiter=self.request.user
        )  
class RecruiterApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiter=self.request.user
        ).order_by("-applied_at")       
        
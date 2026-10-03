from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Company
from .serializers import CompanySerializer


class CompanyCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(recruiter=self.request.user)

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(recruiter=self.request.user)
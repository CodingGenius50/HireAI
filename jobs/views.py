from rest_framework import generics
from .models import Job
from .serializers import JobSerializer
from .permissions import IsRecruiterOwnerOrReadOnly


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOwnerOrReadOnly]

    search_fields = ["title", "skills", "description"]
    filterset_fields = ["location", "job_type"]

    
    
    def get_queryset(self):
        return Job.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        company = self.request.user.company
        serializer.save(company=company)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOwnerOrReadOnly]

    def get_queryset(self):
        return Job.objects.all()
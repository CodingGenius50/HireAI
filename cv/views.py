from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import CV
from .serializers import CVSerializer
from .utils import extract_text_from_pdf, extract_text_from_docx

from .ai_service import analyze_cv, score_cv, match_cv_with_job


class CVView(generics.RetrieveUpdateAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        cv, created = CV.objects.get_or_create(
            user=self.request.user
        )
        return cv
class CVTextExtractView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cv, created = CV.objects.get_or_create(
            user=request.user
        )

        if not cv.file:
            return Response(
                {"error": "No CV uploaded."},
                status=400
            )

        filename = cv.file.name.lower()

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(cv.file)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(cv.file)
        else:
            return Response(
                {"error": "Only PDF and DOCX are supported."},
                status=400
            )

        return Response({
            "filename": cv.file.name,
            "text": text
        })
        
class CVAnalyzeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cv, created = CV.objects.get_or_create(
            user=request.user
        )

        if not cv.file:
            return Response(
                {"error": "No CV uploaded."},
                status=400
            )

        filename = cv.file.name.lower()

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(cv.file)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(cv.file)
        else:
            return Response(
                {"error": "Only PDF and DOCX are supported."},
                status=400
            )

        analysis = analyze_cv(text)

        return Response({
            "filename": cv.file.name,
            "analysis": analysis
        })
        
class CVScoreView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cv, created = CV.objects.get_or_create(
            user=request.user
        )

        if not cv.file:
            return Response(
                {"error": "No CV uploaded."},
                status=400
            )

        filename = cv.file.name.lower()

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(cv.file)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(cv.file)
        else:
            return Response(
                {"error": "Only PDF and DOCX are supported."},
                status=400
            )

        score = score_cv(text)

        return Response({
            "filename": cv.file.name,
            "score": score
        }) 
        
class CVJobMatchView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cv, created = CV.objects.get_or_create(
            user=request.user
        )

        if not cv.file:
            return Response(
                {"error": "No CV uploaded."},
                status=400
            )

        job_id = request.query_params.get("job_id")

        if not job_id:
            return Response(
                {"error": "job_id is required."},
                status=400
            )

        from jobs.models import Job

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"error": "Job not found."},
                status=404
            )

        filename = cv.file.name.lower()

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(cv.file)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(cv.file)
        else:
            return Response(
                {"error": "Only PDF and DOCX are supported."},
                status=400
            )

        result = match_cv_with_job(
            text,
            job.title,
            job.description,
            job.skills
        )

        return Response({
            "job_id": job.id,
            "job_title": job.title,
            "match": result
        })

import logging

from django.db import transaction
from django.utils import timezone

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Application, Interview
from .serializers import (
    ApplicationSerializer,
    ApplicationStatusSerializer,
)

from cv.models import CV
from cv.utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
)
from cv.ai_service import generate_interview_questions


logger = logging.getLogger(__name__)


# =========================================================
# APPLY TO JOB
# =========================================================

class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        uploaded_cv = request.FILES.get("cv")

        if not uploaded_cv:
            return Response(
                {"error": "Please upload your CV before applying."},
                status=400,
            )

        filename = uploaded_cv.name.lower()

        if not filename.endswith((".pdf", ".docx")):
            return Response(
                {"error": "Only PDF and DOCX files are allowed."},
                status=400,
            )

        if uploaded_cv.size > 5 * 1024 * 1024:
            return Response(
                {"error": "CV file must be less than 5 MB."},
                status=400,
            )

        if not request.data.get("job"):
            return Response(
                {"error": "Job ID is required."},
                status=400,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            application = serializer.save(
                applicant=request.user,
                status="APPLIED",
            )

            cv, _ = CV.objects.get_or_create(
                user=request.user
            )

            cv.file = uploaded_cv
            cv.save()

        return Response(
            {
                "message": "Application submitted successfully.",
                "application_id": application.id,
                "status": application.status,
                "interview_available": True,
            },
            status=201,
        )


# =========================================================
# CANDIDATE APPLICATIONS
# =========================================================

class MyApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).order_by("-applied_at")


# =========================================================
# APPLICATION STATUS UPDATE
# =========================================================

class ApplicationStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiter=self.request.user
        )


# =========================================================
# RECRUITER APPLICATIONS
# =========================================================

class RecruiterApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiter=self.request.user
        ).order_by("-applied_at")


# =========================================================
# GENERATE AI INTERVIEW
# =========================================================

class GenerateInterviewQuestionsView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        application_id = request.data.get("application_id")

        if not application_id:
            return Response(
                {"error": "application_id is required."},
                status=400,
            )

        try:
            application = Application.objects.select_related(
                "job"
            ).get(
                id=application_id,
                applicant=request.user,
            )
        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found."},
                status=404,
            )

        # Return an existing interview instead of regenerating it.
        existing = Interview.objects.filter(
            application=application
        ).first()

        if existing:
            safe_questions = [
                {
                    "question": q["question"],
                    "options": q["options"],
                }
                for q in existing.questions
            ]

            return Response({
                "message": "Interview already generated.",
                "interview_id": existing.id,
                "job_title": application.job.title,
                "questions": safe_questions,
                "completed": existing.completed_at is not None,
            })

        if application.status not in [
            "APPLIED",
            "INTERVIEW_QUALIFIED",
        ]:
            return Response(
                {
                    "error":
                    "Interview is not available for this application."
                },
                status=400,
            )

        try:
            cv = CV.objects.get(user=request.user)
        except CV.DoesNotExist:
            return Response(
                {"error": "CV not found. Please upload your CV first."},
                status=400,
            )

        if not cv.file:
            return Response(
                {"error": "No CV file found. Please upload your CV."},
                status=400,
            )

        filename = cv.file.name.lower()

        try:
            if filename.endswith(".pdf"):
                cv_text = extract_text_from_pdf(cv.file)
            elif filename.endswith(".docx"):
                cv_text = extract_text_from_docx(cv.file)
            else:
                return Response(
                    {"error": "Only PDF and DOCX files are supported."},
                    status=400,
                )

            if not cv_text or not cv_text.strip():
                return Response(
                    {
                        "error":
                        "No readable text was found in your CV. "
                        "Please upload a text-based PDF or DOCX."
                    },
                    status=400,
                )

        except Exception as exc:
            logger.exception("CV EXTRACTION ERROR")

            return Response(
                {
                    "error":
                    "Could not read the CV. Please upload a valid, "
                    "text-based PDF or DOCX.",
                    "detail": str(exc),
                },
                status=400,
            )

        job = application.job

        try:
            questions = generate_interview_questions(
                cv_text=cv_text,
                job_title=job.title,
                job_description=job.description or "",
                job_skills=job.skills or "",
            )

            if not isinstance(questions, list) or len(questions) != 5:
                raise ValueError(
                    "AI must return exactly five questions."
                )

            # Validate before saving.
            for q in questions:
                if not isinstance(q.get("question"), str):
                    raise ValueError("Invalid question text.")

                if not isinstance(q.get("options"), list):
                    raise ValueError("Invalid question options.")

                if len(q["options"]) != 4:
                    raise ValueError(
                        "Every question must have four options."
                    )

                answer = q.get("correct_answer")

                if (
                    isinstance(answer, bool)
                    or not isinstance(answer, int)
                    or answer not in [0, 1, 2, 3]
                ):
                    raise ValueError("Invalid correct answer index.")

        except Exception:
            logger.exception("INTERVIEW QUESTION GENERATION ERROR")

            return Response(
                {
                    "error":
                    "Failed to generate interview questions. "
                    "Please try again later."
                },
                status=502,
            )

        # Protect against duplicate interview creation.
        with transaction.atomic():
            interview, created = Interview.objects.get_or_create(
                application=application,
                defaults={
                    "questions": questions,
                    "answers": [],
                },
            )

        safe_questions = [
            {
                "question": q["question"],
                "options": q["options"],
            }
            for q in interview.questions
        ]

        return Response(
            {
                "message": (
                    "Interview generated successfully."
                    if created
                    else "Interview already generated."
                ),
                "interview_id": interview.id,
                "job_title": job.title,
                "questions": safe_questions,
                "completed": interview.completed_at is not None,
            },
            status=201 if created else 200,
        )


# =========================================================
# SUBMIT INTERVIEW ANSWERS
# =========================================================

class SubmitInterviewAnswersView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        interview_id = request.data.get("interview_id")
        answers = request.data.get("answers")

        if not interview_id:
            return Response(
                {"error": "interview_id is required."},
                status=400,
            )

        if not isinstance(answers, list) or len(answers) != 5:
            return Response(
                {"error": "Exactly 5 answers are required."},
                status=400,
            )

        for answer in answers:
            if (
                isinstance(answer, bool)
                or not isinstance(answer, int)
                or answer not in [0, 1, 2, 3]
            ):
                return Response(
                    {"error": "Each answer must be 0, 1, 2, or 3."},
                    status=400,
                )

        try:
            interview = Interview.objects.select_related(
                "application"
            ).get(
                id=interview_id,
                application__applicant=request.user,
            )
        except Interview.DoesNotExist:
            return Response(
                {"error": "Interview not found."},
                status=404,
            )

        if interview.completed_at:
            return Response(
                {"error": "Interview has already been completed."},
                status=400,
            )

        questions = interview.questions

        if not isinstance(questions, list) or len(questions) != 5:
            return Response(
                {"error": "Interview must contain exactly 5 questions."},
                status=400,
            )

        correct = sum(
            1
            for index, question in enumerate(questions)
            if answers[index] == question.get("correct_answer")
        )

        score = correct * 20

        interview.answers = answers
        interview.interview_score = score
        interview.feedback = (
            f"You answered {correct} out of 5 questions correctly. "
            f"Your interview score is {score}/100."
        )
        interview.completed_at = timezone.now()
        interview.save()

        application = interview.application
        application.status = (
            "SHORTLISTED" if score >= 40 else "REJECTED"
        )
        application.save(update_fields=["status"])

        return Response({
            "message": "Interview completed successfully.",
            "correct_answers": correct,
            "total_questions": 5,
            "score": score,
            "status": application.status,
            "feedback": interview.feedback,
        })

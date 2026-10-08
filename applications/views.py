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

from cv.ai_service import (
    evaluate_application,
    generate_interview_questions,
)

class ApplicationCreateView(generics.CreateAPIView):
    
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        uploaded_cv = request.FILES.get("cv")

        # CV required
        if not uploaded_cv:
            return Response(
                {
                    "error": "Please upload your CV before applying."
                },
                status=400
            )

        # File type validation
        filename = uploaded_cv.name.lower()

        if not (
            filename.endswith(".pdf")
            or filename.endswith(".docx")
        ):
            return Response(
                {
                    "error": "Only PDF and DOCX files are allowed."
                },
                status=400
            )

        # File size validation
        if uploaded_cv.size > 5 * 1024 * 1024:
            return Response(
                {
                    "error": "CV file must be less than 5 MB."
                },
                status=400
            )

        # Job ID
        job_id = request.data.get("job")

        if not job_id:
            return Response(
                {
                    "error": "Job ID is required."
                },
                status=400
            )

        # Prevent duplicate application
     

        # Validate application data
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        # Create application
        application = serializer.save(
            applicant=request.user
        )

        try:

            # --------------------------------
            # SAVE CV
            # --------------------------------

            cv, created = CV.objects.get_or_create(
                user=request.user
            )

            cv.file = uploaded_cv
            cv.save()

            # --------------------------------
            # EXTRACT CV TEXT
            # --------------------------------

            if filename.endswith(".pdf"):

                cv_text = extract_text_from_pdf(
                    cv.file
                )

            else:

                cv_text = extract_text_from_docx(
                    cv.file
                )

            # --------------------------------
            # CHECK CV TEXT
            # --------------------------------

            if not cv_text or not cv_text.strip():

                application.status = "APPLIED"
                application.save()

                return Response(
                    {
                        "message":
                        "Application submitted successfully.",

                        "application_id":
                        application.id,

                        "status":
                        application.status,

                        "interview_available":
                        True
                    },
                    status=201
                )

            # --------------------------------
            # NO AI SCREENING / NO REJECTION
            # --------------------------------
            #
            # Demo project requirement:
            #
            # CV uploaded
            #       ↓
            # Application = APPLIED
            #       ↓
            # AI Interview Available
            #
            # No score
            # No eligibility check
            # No rejection
            #

            application.status = "APPLIED"
            application.save()

            return Response(
                {
                    "message":
                    "Application submitted successfully.",

                    "application_id":
                    application.id,

                    "status":
                    application.status,

                    "interview_available":
                    True
                },
                status=201
            )

        except Exception as e:

            print(
                "CV PROCESSING ERROR:",
                repr(e)
            )

            # IMPORTANT:
            # Even if CV text extraction fails,
            # do NOT reject the application.

            application.status = "APPLIED"
            application.save()

            return Response(
                {
                    "message":
                    "Application submitted successfully.",

                    "application_id":
                    application.id,

                    "status":
                    application.status,

                    "interview_available":
                    True
                },
                status=201
            )
# =========================================================
# APPLY TO JOB
# =========================================================

class MyApplicationListView(
    generics.ListAPIView
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Application.objects.filter(
            applicant=self.request.user
        ).order_by(
            "-applied_at"
        )


# =========================================================
# APPLICATION STATUS UPDATE
# =========================================================

class ApplicationStatusUpdateView(
    generics.UpdateAPIView
):

    serializer_class = (
        ApplicationStatusSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Application.objects.filter(
            job__company__recruiter=self.request.user
        )


# =========================================================
# RECRUITER APPLICATION LIST
# =========================================================

class RecruiterApplicationListView(
    generics.ListAPIView
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Application.objects.filter(
            job__company__recruiter=self.request.user
        ).order_by(
            "-applied_at"
        )


# =========================================================
# GENERATE AI INTERVIEW QUESTIONS
# =========================================================

class GenerateInterviewQuestionsView(
    generics.CreateAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        *args,
        **kwargs
    ):

        application_id = request.data.get(
            "application_id"
        )

        if not application_id:

            return Response(
                {
                    "error":
                    "application_id is required."
                },
                status=400
            )

        try:

            application = Application.objects.get(
                id=application_id,
                applicant=request.user
            )

        except Application.DoesNotExist:

            return Response(
                {
                    "error":
                    "Application not found."
                },
                status=404
            )

        # ---------------------------------------------
        # CHECK ELIGIBILITY
        # ---------------------------------------------
        if application.status not in [
    "APPLIED",
    "INTERVIEW_QUALIFIED"
        ]:
          return Response(
        {
            "error": "Interview is not available for this application."
        },
        status=400
    )


        # ---------------------------------------------
        # EXISTING INTERVIEW
        # ---------------------------------------------

        existing_interview = (
            Interview.objects.filter(
                application=application
            ).first()
        )

        if existing_interview:

            safe_questions = []

            for question in (
                existing_interview.questions
            ):

                safe_questions.append(
                    {
                        "question":
                        question["question"],

                        "options":
                        question["options"]
                    }
                )

            return Response(
                {
                    "message":
                    "Interview already generated.",

                    "interview_id":
                    existing_interview.id,

                    "questions":
                    safe_questions,
                }
            )

        # ---------------------------------------------
        # GET CV
        # ---------------------------------------------

        try:

            cv = CV.objects.get(
                user=request.user
            )

        except CV.DoesNotExist:

            return Response(
                {
                    "error":
                    "CV not found."
                },
                status=400
            )

        if not cv.file:

            return Response(
                {
                    "error":
                    "No CV file found."
                },
                status=400
            )

        # ---------------------------------------------
        # EXTRACT CV TEXT
        # ---------------------------------------------

        filename = cv.file.name.lower()

        try:

            if filename.endswith(".pdf"):

                cv_text = extract_text_from_pdf(
                    cv.file
                )

            elif filename.endswith(".docx"):

                cv_text = extract_text_from_docx(
                    cv.file
                )

            else:

                return Response(
                    {
                        "error":
                        "Only PDF and DOCX are supported."
                    },
                    status=400
                )

        except Exception as e:

            print(
                "CV EXTRACTION ERROR:",
                repr(e)
            )

            return Response(
                {
                    "error":
                    "Failed to extract CV text."
                },
                status=500
            )

        # ---------------------------------------------
        # JOB
        # ---------------------------------------------

        job = application.job

        # ---------------------------------------------
        # GENERATE 5 MCQs
        # ---------------------------------------------

        try:

            questions = generate_interview_questions(

                cv_text,

                job.title,

                job.description,

                job.skills
            )

        except Exception as e:

            print(
                "INTERVIEW QUESTION ERROR:",
                repr(e)
            )

            return Response(
                {
                    "error":
                    "Failed to generate interview questions."
                },
                status=500
            )

        # ---------------------------------------------
        # CREATE INTERVIEW
        # ---------------------------------------------

        interview = Interview.objects.create(

            application=application,

            questions=questions,

            answers=[]
        )

        # ---------------------------------------------
        # HIDE CORRECT ANSWERS
        # ---------------------------------------------

        safe_questions = []

        for question in questions:

            safe_questions.append(
                {
                    "question":
                    question["question"],

                    "options":
                    question["options"]
                }
            )

        # ---------------------------------------------
        # RESPONSE
        # ---------------------------------------------

        return Response(
            {
                "message":
                "Interview generated successfully.",

                "interview_id":
                interview.id,

                "job_title":
                job.title,

                "questions":
                safe_questions,
            },
            status=201
        )


# =========================================================
# SUBMIT INTERVIEW ANSWERS
# =========================================================

class SubmitInterviewAnswersView(
    generics.UpdateAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def put(
        self,
        request,
        *args,
        **kwargs
    ):

        interview_id = request.data.get(
            "interview_id"
        )

        answers = request.data.get(
            "answers"
        )

        # ---------------------------------------------
        # VALIDATE INPUT
        # ---------------------------------------------

        if not interview_id:

            return Response(
                {
                    "error":
                    "interview_id is required."
                },
                status=400
            )

        if not isinstance(answers, list):

            return Response(
                {
                    "error":
                    "answers must be a list."
                },
                status=400
            )

        # ---------------------------------------------
        # GET INTERVIEW
        # ---------------------------------------------

        try:

            interview = Interview.objects.get(
                id=interview_id,
                application__applicant=request.user
            )

        except Interview.DoesNotExist:

            return Response(
                {
                    "error":
                    "Interview not found."
                },
                status=404
            )

        # ---------------------------------------------
        # PREVENT RESUBMISSION
        # ---------------------------------------------

        if interview.completed_at:

            return Response(
                {
                    "error":
                    "Interview has already been completed."
                },
                status=400
            )

        # ---------------------------------------------
        # CHECK 5 ANSWERS
        # ---------------------------------------------

        if len(answers) != 5:

            return Response(
                {
                    "error":
                    "Exactly 5 answers are required."
                },
                status=400
            )

        # ---------------------------------------------
        # VALIDATE ANSWERS
        # ---------------------------------------------

        for answer in answers:

            if answer not in [0, 1, 2, 3]:

                return Response(
                    {
                        "error":
                        "Each answer must be 0, 1, 2, or 3."
                    },
                    status=400
                )

        # ---------------------------------------------
        # QUESTIONS
        # ---------------------------------------------

        questions = interview.questions

        if len(questions) != 5:

            return Response(
                {
                    "error":
                    "Interview does not contain 5 questions."
                },
                status=400
            )

        # ---------------------------------------------
        # CALCULATE SCORE
        # ---------------------------------------------

        correct = 0

        for index in range(5):

            correct_answer = questions[index].get(
                "correct_answer"
            )

            if answers[index] == correct_answer:

                correct += 1

        score = (correct / 5) * 100

        # ---------------------------------------------
        # SAVE INTERVIEW
        # ---------------------------------------------

        interview.answers = answers

        interview.interview_score = score

        interview.feedback = (
            f"You answered {correct} out of 5 "
            f"questions correctly. "
            f"Your interview score is {score:.0f}/100."
        )

        from django.utils import timezone

        interview.completed_at = timezone.now()

        interview.save()

        # ---------------------------------------------
        # UPDATE APPLICATION
        # ---------------------------------------------

        application = interview.application

        if score >= 40:

            application.status = "SHORTLISTED"

        else:

            application.status = "REJECTED"

        application.save()

        # ---------------------------------------------
        # RESPONSE
        # ---------------------------------------------

        return Response(
            {
                "message":
                "Interview completed successfully.",

                "correct_answers":
                correct,

                "total_questions":
                5,

                "score":
                score,

                "status":
                application.status,

                "feedback":
                interview.feedback,
            },
            status=200
        )
from io import BytesIO

from django.http import HttpResponse
from django.core.files.base import ContentFile

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.response import Response

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.units import mm

from .models import CV
from .serializers import CVSerializer
from .utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
)
from .ai_service import (
    analyze_cv,
    score_cv,
    match_cv_with_job,
)


# =========================================================
# CV CREATE / UPDATE / GET
# =========================================================

class CVView(generics.RetrieveUpdateAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_object(self):
        cv, created = CV.objects.get_or_create(
            user=self.request.user
        )

        return cv


# =========================================================
# CV TEXT EXTRACTION
# =========================================================

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
                {
                    "error":
                    "Only PDF and DOCX are supported."
                },
                status=400
            )

        return Response({
            "filename": cv.file.name,
            "text": text
        })


# =========================================================
# AI CV ANALYSIS
# =========================================================

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
                {
                    "error":
                    "Only PDF and DOCX are supported."
                },
                status=400
            )

        analysis = analyze_cv(text)

        return Response({
            "filename": cv.file.name,
            "analysis": analysis
        })


# =========================================================
# AI CV SCORE
# =========================================================

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
                {
                    "error":
                    "Only PDF and DOCX are supported."
                },
                status=400
            )

        score = score_cv(text)

        return Response({
            "filename": cv.file.name,
            "score": score
        })


# =========================================================
# AI CV + JOB MATCH
# =========================================================

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
                {
                    "error":
                    "job_id is required."
                },
                status=400
            )

        from jobs.models import Job

        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "error":
                    "Job not found."
                },
                status=404
            )

        filename = cv.file.name.lower()

        if filename.endswith(".pdf"):

            text = extract_text_from_pdf(cv.file)

        elif filename.endswith(".docx"):

            text = extract_text_from_docx(cv.file)

        else:

            return Response(
                {
                    "error":
                    "Only PDF and DOCX are supported."
                },
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


# =========================================================
# PROFESSIONAL CV PDF
# =========================================================

class CVGeneratePDFView(generics.RetrieveAPIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):

        cv, created = CV.objects.get_or_create(
            user=request.user
        )

        # -------------------------------------------------
        # REQUIRED FIELDS CHECK
        # -------------------------------------------------

        if not all([
            cv.name,
            cv.email,
            cv.education,
            cv.skills,
            cv.experience
        ]):

            return Response(
                {
                    "error":
                    "Please complete all 5 required CV fields."
                },
                status=400
            )

        # -------------------------------------------------
        # PDF BUFFER
        # -------------------------------------------------

        buffer = BytesIO()

        doc = SimpleDocTemplate(

            buffer,

            pagesize=A4,

            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm,
        )

        # -------------------------------------------------
        # COLORS
        # -------------------------------------------------

        NAVY = colors.HexColor("#123B73")
        BLUE = colors.HexColor("#2563EB")
        LIGHT_BLUE = colors.HexColor("#EFF6FF")
        DARK = colors.HexColor("#1F2937")
        GRAY = colors.HexColor("#6B7280")
        LIGHT_GRAY = colors.HexColor("#E5E7EB")

        # -------------------------------------------------
        # STYLES
        # -------------------------------------------------

        styles = getSampleStyleSheet()

        name_style = ParagraphStyle(
            "CVName",
            parent=styles["Title"],

            fontName="Helvetica-Bold",

            fontSize=24,
            leading=28,

            alignment=TA_CENTER,

            textColor=NAVY,

            spaceAfter=3,
        )

        role_style = ParagraphStyle(
            "CVRole",
            parent=styles["Normal"],

            fontName="Helvetica-Bold",

            fontSize=11,
            leading=14,

            alignment=TA_CENTER,

            textColor=BLUE,

            spaceAfter=5,
        )

        contact_style = ParagraphStyle(
            "CVContact",
            parent=styles["Normal"],

            fontSize=8.8,
            leading=12,

            alignment=TA_CENTER,

            textColor=GRAY,

            spaceAfter=12,
        )

        heading_style = ParagraphStyle(
            "SectionHeading",

            parent=styles["Heading2"],

            fontName="Helvetica-Bold",

            fontSize=11.5,
            leading=14,

            textColor=NAVY,

            spaceBefore=8,
            spaceAfter=5,
        )

        body_style = ParagraphStyle(
            "CVBody",

            parent=styles["BodyText"],

            fontName="Helvetica",

            fontSize=9.3,
            leading=14,

            textColor=DARK,

            spaceAfter=4,
        )

        small_style = ParagraphStyle(
            "CVSmall",

            parent=styles["Normal"],

            fontSize=8,

            textColor=GRAY,

            alignment=TA_CENTER,
        )

        # -------------------------------------------------
        # STORY
        # -------------------------------------------------

        story = []

        # -------------------------------------------------
        # HEADER
        # -------------------------------------------------

        story.append(
            Spacer(1, 2 * mm)
        )

        story.append(
            Paragraph(
                cv.name.upper(),
                name_style
            )
        )

        story.append(
            Paragraph(
                "COMPUTER SCIENCE & ENGINEERING",
                role_style
            )
        )

        story.append(
            Paragraph(
                f"{cv.email} "
                "&nbsp;&nbsp; | &nbsp;&nbsp;"
                "Software Engineering "
                "&nbsp; | &nbsp;"
                "Backend Development "
                "&nbsp; | &nbsp;"
                "AI",
                contact_style
            )
        )

        # -------------------------------------------------
        # HEADER LINE
        # -------------------------------------------------

        header_line = Table(
            [[""]],
            colWidths=[174 * mm],
            rowHeights=[1.2 * mm],
        )

        header_line.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    BLUE
                ),
            ])
        )

        story.append(
            header_line
        )

        story.append(
            Spacer(1, 2 * mm)
        )

        # -------------------------------------------------
        # PROFESSIONAL SUMMARY
        # -------------------------------------------------

        story.append(
            Paragraph(
                "PROFESSIONAL SUMMARY",
                heading_style
            )
        )

        story.append(
            Paragraph(
                "Motivated Computer Science and Engineering "
                "professional with a strong interest in software "
                "development, backend engineering, database systems "
                "and artificial intelligence. Passionate about "
                "problem solving, learning modern technologies and "
                "building practical software solutions.",
                body_style
            )
        )

        # -------------------------------------------------
        # EDUCATION
        # -------------------------------------------------

        story.append(
            Paragraph(
                "EDUCATION",
                heading_style
            )
        )

        education_text = (
            cv.education
            .replace("&", "&amp;")
            .replace("\n", "<br/>")
        )

        story.append(
            Paragraph(
                education_text,
                body_style
            )
        )

        # -------------------------------------------------
        # TECHNICAL SKILLS
        # -------------------------------------------------

        story.append(
            Paragraph(
                "TECHNICAL SKILLS",
                heading_style
            )
        )

        skills_text = (
            cv.skills
            .replace("&", "&amp;")
            .replace("\n", "<br/>")
        )

        story.append(
            Paragraph(
                skills_text,
                body_style
            )
        )

        # -------------------------------------------------
        # EXPERIENCE
        # -------------------------------------------------

        story.append(
            Paragraph(
                "EXPERIENCE",
                heading_style
            )
        )

        experience_text = (
            cv.experience
            .replace("&", "&amp;")
            .replace("\n", "<br/>")
        )

        story.append(
            Paragraph(
                experience_text,
                body_style
            )
        )

        # -------------------------------------------------
        # PROJECTS
        # -------------------------------------------------

        story.append(
            Paragraph(
                "PROJECTS & PRACTICAL INTERESTS",
                heading_style
            )
        )

        projects_text = (
            "<b>HireAI — Smart Recruitment & "
            "Application Tracking System</b><br/>"
            "AI-assisted recruitment platform with "
            "CV generation, job applications, candidate "
            "evaluation and interview workflow.<br/><br/>"

            "<b>Backend & API Development</b><br/>"
            "REST API development, authentication, "
            "database integration and web application "
            "development."
        )

        story.append(
            Paragraph(
                projects_text,
                body_style
            )
        )

        # -------------------------------------------------
        # AREAS OF INTEREST BOX
        # -------------------------------------------------

        story.append(
            Paragraph(
                "AREAS OF INTEREST",
                heading_style
            )
        )

        interest_data = [[
            Paragraph(
                "Software Engineering",
                body_style
            ),
            Paragraph(
                "Backend Development",
                body_style
            ),
            Paragraph(
                "Artificial Intelligence",
                body_style
            ),
        ], [
            Paragraph(
                "Machine Learning",
                body_style
            ),
            Paragraph(
                "Database Systems",
                body_style
            ),
            Paragraph(
                "Web Development",
                body_style
            ),
        ]]

        interest_table = Table(
            interest_data,
            colWidths=[
                58 * mm,
                58 * mm,
                58 * mm,
            ],
            hAlign="CENTER",
        )

        interest_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    LIGHT_BLUE
                ),

                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.7,
                    LIGHT_GRAY
                ),

                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    LIGHT_GRAY
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),
            ])
        )

        story.append(
            interest_table
        )

        # -------------------------------------------------
        # CAREER OBJECTIVE
        # -------------------------------------------------

        story.append(
            Paragraph(
                "CAREER OBJECTIVE",
                heading_style
            )
        )

        story.append(
            Paragraph(
                "To build a successful career in the technology "
                "sector by continuously improving technical and "
                "professional skills while contributing to "
                "innovative and impactful software solutions.",
                body_style
            )
        )

        # -------------------------------------------------
        # REFERENCES
        # -------------------------------------------------

        story.append(
            Paragraph(
                "REFERENCES",
                heading_style
            )
        )

        story.append(
            Paragraph(
                "References available upon request.",
                body_style
            )
        )

        # -------------------------------------------------
        # FOOTER
        # -------------------------------------------------

        story.append(
            Spacer(1, 5 * mm)
        )

        footer_line = Table(
            [[""]],
            colWidths=[174 * mm],
            rowHeights=[0.5 * mm],
        )

        footer_line.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    LIGHT_GRAY
                ),
            ])
        )

        story.append(
            footer_line
        )

        story.append(
            Spacer(1, 2 * mm)
        )

        story.append(
            Paragraph(
                "Computer Science & Engineering • Professional CV",
                small_style
            )
        )

        # -------------------------------------------------
        # BUILD PDF
        # -------------------------------------------------

        doc.build(story)

        pdf_data = buffer.getvalue()

        buffer.close()

        # -------------------------------------------------
        # SAVE PDF TO CV FILE
        # -------------------------------------------------

        filename = (
            f"{cv.name.replace(' ', '_')}_CV.pdf"
        )

        cv.file.save(
            filename,
            ContentFile(pdf_data),
            save=True
        )

        # -------------------------------------------------
        # DOWNLOAD RESPONSE
        # -------------------------------------------------

        response = HttpResponse(
            pdf_data,
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}"'
        )

        return response
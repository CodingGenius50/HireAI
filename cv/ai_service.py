from google import genai
from django.conf import settings
import json
import re


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# =========================================================
# GENERAL CV ANALYSIS
# =========================================================

def analyze_cv(text):

    response = client.models.generate_content(
        model="gemini-3.6-flash",

        contents=f"""
You are an AI recruitment assistant.

Analyze the following CV and provide:

1. Candidate Summary
2. Technical Skills
3. Education
4. Experience
5. Strengths
6. Weaknesses
7. Suitable Job Roles
8. Overall CV Score out of 100

CV:

{text}
"""
    )

    return response.text


# =========================================================
# JSON EXTRACTION
# =========================================================

def extract_json(text):

    text = text.strip()

    text = re.sub(
        r"```json",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"```",
        "",
        text
    )

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:

        raise ValueError(
            "AI did not return valid JSON."
        )

    return json.loads(
        text[start:end + 1]
    )


# =========================================================
# CV SCORE
# =========================================================

def score_cv(text):

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=f"""
You are an AI recruitment assistant.

Evaluate this CV for a software/technical job.

Return ONLY valid JSON.
Do not write anything outside the JSON.

Required format:

{{
    "overall_score": 0,
    "skills_score": 0,
    "education_score": 0,
    "experience_score": 0,
    "cv_quality_score": 0,
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
}}

All scores must be numbers between 0 and 100.

CV:
{text}
"""
        )

        return extract_json(
            response.text
        )

    except Exception as e:

        print(
            "GEMINI SCORE ERROR:",
            repr(e)
        )

        raise


# =========================================================
# CV + JOB MATCH
# =========================================================

def match_cv_with_job(
    cv_text,
    job_title,
    job_description,
    job_skills
):

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=f"""
You are an AI recruitment matching assistant.

Compare the candidate's CV with the job requirements.

Return ONLY valid JSON.
Do not write anything outside the JSON.

Required format:

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "candidate_strengths": [],
    "recommendation": "",
    "reason": ""
}}

match_score must be a number between 0 and 100.

Recommendation must be one of:

"Suitable"
"Partially Suitable"
"Not Suitable"

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS:
{job_skills}

CANDIDATE CV:
{cv_text}
"""
        )

        return extract_json(
            response.text
        )

    except Exception as e:

        print(
            "GEMINI MATCH ERROR:",
            repr(e)
        )

        raise


# =========================================================
# APPLICATION AI EVALUATION
# =========================================================

def evaluate_application(
    cv_text,
    job_title,
    job_description,
    job_skills
):

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=f"""
You are an AI recruitment assistant.

Evaluate whether this candidate should proceed
to an AI interview for the given job.

Return ONLY valid JSON.

Required format:

{{
    "cv_score": 0,
    "match_score": 0,
    "overall_score": 0,
    "interview_eligible": false,
    "reason": ""
}}

Rules:

- All scores must be between 0 and 100.
- overall_score should consider both CV quality
  and job matching.
- interview_eligible should be true if
  overall_score >= 60.
- Do not make the final hiring decision.
- This is only an interview eligibility recommendation.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS:
{job_skills}

CANDIDATE CV:
{cv_text}
"""
        )

        return extract_json(
            response.text
        )

    except Exception as e:

        print(
            "GEMINI APPLICATION EVALUATION ERROR:",
            repr(e)
        )

        raise


# =========================================================
# RANDOM 5 MCQ INTERVIEW QUESTIONS
# =========================================================

def generate_interview_questions(
    cv_text,
    job_title,
    job_description,
    job_skills
):
    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",

            contents=f"""
You are an AI technical interview system
for a simple recruitment platform.

Generate exactly 5 SIMPLE and SHORT
multiple-choice questions.

The questions must be based on:

1. Candidate's CV
2. Job requirements

IMPORTANT RULES:

- Questions must be EASY to MODERATE.
- Do NOT generate difficult questions.
- Do NOT generate advanced theoretical questions.
- Do NOT generate long questions.
- Keep every question SHORT and clear.
- Use simple English.
- Each question should normally be one sentence.
- Avoid confusing wording.
- Avoid tricky questions.
- Avoid multi-part questions.
- Questions should be suitable for a junior CSE/software candidate.
- Focus on basic practical technical knowledge.

Possible topics:

- Programming basics
- Python
- Django
- REST API
- Database
- SQL
- Git
- HTML/CSS
- JavaScript
- Basic software engineering
- Basic problem solving
- Job-related basic skills

IMPORTANT:

- Exactly 5 questions.
- Each question must have exactly 4 options.
- Only ONE option is correct.
- Questions should be different from each other.
- Try to vary the topics.
- Do not ask personal questions.
- Do not ask religious questions.
- Do not ask political questions.
- Do not ask discriminatory questions.
- Do not reveal the answer inside the question.

Return ONLY valid JSON.

Required JSON format:

{{
    "questions": [
        {{
            "question": "What is Python?",
            "options": [
                "A programming language",
                "A database",
                "An operating system",
                "A web browser"
            ],
            "correct_answer": 0
        }},
        {{
            "question": "What does API stand for?",
            "options": [
                "Application Programming Interface",
                "Advanced Program Internet",
                "Application Process Input",
                "Automated Programming Instruction"
            ],
            "correct_answer": 0
        }}
    ]
}}

IMPORTANT:

correct_answer represents the option INDEX.

0 = Option A
1 = Option B
2 = Option C
3 = Option D

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS:
{job_skills}

CANDIDATE CV:
{cv_text}
"""
        )

        result = extract_json(
            response.text
        )

        questions = result.get(
            "questions",
            []
        )

        # Must have exactly 5 questions
        if len(questions) != 5:
            raise ValueError(
                "AI did not generate exactly 5 questions."
            )

        # Validate every question
        for question in questions:

            if "question" not in question:
                raise ValueError(
                    "Question text is missing."
                )

            if "options" not in question:
                raise ValueError(
                    "Question options are missing."
                )

            if len(question["options"]) != 4:
                raise ValueError(
                    "Each question must have exactly 4 options."
                )

            if "correct_answer" not in question:
                raise ValueError(
                    "Correct answer is missing."
                )

            if question["correct_answer"] not in [
                0,
                1,
                2,
                3
            ]:
                raise ValueError(
                    "Invalid correct answer index."
                )

        return questions

    except Exception as e:

        print(
            "GEMINI INTERVIEW QUESTION ERROR:",
            repr(e)
        )

        raise
from google import genai
from django.conf import settings
from google.genai import errors

client = genai.Client(api_key=settings.GEMINI_API_KEY)




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

def score_cv(text):
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"""
You are an AI recruitment assistant.

Evaluate this CV and give a recruitment score.

Return exactly these sections:

Overall Score: X/100
Skills Score: X/100
Education Score: X/100
Experience Score: X/100
CV Quality Score: X/100

Strengths:
- ...

Weaknesses:
- ...

Suggestions:
- ...

CV:
{text}
"""
        )

        return response.text

    except Exception as e:
        print("GEMINI SCORE ERROR:", repr(e))
        raise





def match_cv_with_job(cv_text, job_title, job_description, job_skills):
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=f"""
You are an AI recruitment matching assistant.

Compare the candidate's CV with the job requirements.

Return exactly:

Match Score: X/100

Matched Skills:
- ...

Missing Skills:
- ...

Candidate Strengths:
- ...

Recommendation:
Suitable / Partially Suitable / Not Suitable

Reason:
...

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

    return response.text
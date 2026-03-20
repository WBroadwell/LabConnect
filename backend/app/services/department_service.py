import urllib.parse

from app.exceptions import NotFoundError
from app.models import User

DEPARTMENT_DESCRIPTIONS = {
    "Architecture": "Designing the built environment through architectural theory, design, and technology.",
    "Arts": "Exploring creative expression through visual arts, music, performance, and digital media.",
    "Biological Sciences": "Studying living systems across scales, from molecular biology to ecosystems.",
    "Biomedical Engineering": "Applying engineering principles to medicine and biology to improve healthcare and medical technologies.",
    "Chemical and Biological Engineering": "Designing processes for chemical production and biological systems in industries like energy and pharmaceuticals.",
    "Chemistry and Chemical Biology": "Investigating molecular structure, reactions, and chemical systems for scientific and industrial applications.",
    "Civil and Environmental Engineering": "Designing and maintaining infrastructure while addressing environmental challenges and sustainability.",
    "Cognitive Science": "Understanding the mind and intelligence through interdisciplinary study of psychology, neuroscience, and computation.",
    "Communication and Media": "Analyzing communication systems, media, and digital technologies in society.",
    "Computer Science": "Advancing computing through algorithms, artificial intelligence, systems, and software development.",
    "Decision Sciences and Engineering Systems": "Applying analytics, optimization, and systems thinking to complex decision-making problems.",
    "Earth and Environmental Sciences": "Studying Earth systems, geology, climate, and environmental processes.",
    "Economics": "Analyzing economic behavior, markets, and policy decisions.",
    "Electrical, Computer, and Systems Engineering": "Developing technologies in electronics, computing systems, and complex engineered systems.",
    "Games and Simulation Arts and Sciences": "Creating interactive digital experiences through game design, simulation, and emerging media.",
    "Humanities, Arts, and Social Sciences": "Exploring human culture, history, philosophy, and social systems.",
    "Industrial and Systems Engineering": "Optimizing processes and systems in manufacturing, logistics, and operations.",
    "Information Technology and Web Science": "Studying data, networks, and web-based systems to understand and build digital infrastructure.",
    "Lally School of Management": "Focusing on business, management, entrepreneurship, and technology-driven innovation.",
    "Materials Science and Engineering": "Developing and studying materials for applications in technology and industry.",
    "Mathematical Sciences": "Advancing mathematics and statistics for scientific, engineering, and data-driven applications.",
    "Mechanical, Aerospace, and Nuclear Engineering": "Engineering mechanical systems, aircraft, spacecraft, and nuclear technologies.",
    "Physics, Applied Physics, and Astronomy": "Studying fundamental physical laws and their applications to real-world technologies.",
    "Science and Technology Studies": "Examining how science and technology interact with society, politics, and culture.",
}


def list_departments() -> list[dict]:
    """Return departments that have at least one professor, with counts and descriptions."""
    professors = User.query.filter_by(role="professor").all()

    department_counts: dict[str, int] = {}
    for prof in professors:
        for dept in prof.departments or []:
            department_counts[dept] = department_counts.get(dept, 0) + 1

    return [
        {
            "name": dept_name,
            "description": DEPARTMENT_DESCRIPTIONS.get(dept_name, ""),
            "professor_count": count,
        }
        for dept_name, count in sorted(department_counts.items())
    ]


def get_department(department_name: str) -> dict:
    """Return a department with its professors. Raises NotFoundError if not found."""
    decoded_name = urllib.parse.unquote(department_name)

    matching_dept = None
    for dept in DEPARTMENT_DESCRIPTIONS:
        if dept.lower() == decoded_name.lower():
            matching_dept = dept
            break

    if not matching_dept:
        raise NotFoundError("Department not found")

    professors = User.query.filter_by(role="professor").all()
    dept_professors = [
        prof.to_dict()
        for prof in professors
        if matching_dept in (prof.departments or [])
    ]

    return {
        "name": matching_dept,
        "description": DEPARTMENT_DESCRIPTIONS.get(matching_dept, ""),
        "professors": dept_professors,
    }

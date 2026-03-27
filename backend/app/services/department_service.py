import urllib.parse

from app.exceptions import NotFoundError
from app.models import User



DEPARTMENT_DESCRIPTIONS = {
    "Biomedical Engineering": "Applying engineering principles to medicine and biology for healthcare advancements, including medical devices, tissue engineering, and biomaterials.", 
    "Chemical and Biological Engineering": "Designing processes for chemical production and biological systems, spanning pharmaceuticals, energy, and sustainable manufacturing.", 
    "Civil and Environmental Engineering": "Building sustainable infrastructure and protecting our environment through innovative design and engineering solutions.", 
    "Computer Science": "Advancing computing theory and practice, from algorithms and systems to artificial intelligence and software engineering.", 
    "Electrical, Computer, and Systems Engineering": "Pioneering innovations in electronics, computing systems, and complex system design for modern technology.", 
    "Industrial and Systems Engineering": "Optimizing complex systems and processes to improve efficiency in manufacturing, logistics, and operations.", 
    "Materials Science and Engineering": "Discovering and developing new materials that enable technological advances across industries.", 
    "Mechanical, Aerospace, and Nuclear Engineering": "Engineering mechanical systems, aircraft, spacecraft, and nuclear technologies for the future.", 
    "Mathematics": "Exploring pure and applied mathematics, providing foundations for science, engineering, and data analysis.", 
    "Physics, Applied Physics, and Astronomy": "Investigating the fundamental laws of nature and applying physics to solve real-world problems.", 
    "Chemistry and Chemical Biology": "Understanding matter at the molecular level and developing new chemical processes and compounds.", 
    "Biology": "Studying living organisms and life processes, from molecular biology to ecology and evolution.", 
    "Earth and Environmental Sciences": "Researching Earth systems, climate, geology, and environmental processes for a sustainable future.", 
    "Cognitive Science": "Exploring the nature of mind and intelligence through interdisciplinary research in psychology, neuroscience, and AI.", 
    "Economics": "Analyzing economic systems, markets, and policy to understand resource allocation and decision-making.", 
    "Science and Technology Studies": "Examining the social, cultural, and political dimensions of science and technology.", 
    "Architecture": "Designing buildings and spaces that shape how we live, work, and interact with our environment.", 
    "Arts": "Fostering creativity and expression through visual arts, music, and digital media.", 
    "Communication and Media": "Studying communication processes and media systems in the digital age.", 
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

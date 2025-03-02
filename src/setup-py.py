from setuptools import setup, find_packages

setup(
    name="office-system",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "pydantic"
    ]
)

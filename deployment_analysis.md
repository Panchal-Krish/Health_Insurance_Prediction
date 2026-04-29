# Deployment Analysis: Health Insurance Prediction

This document provides an in-depth analysis of the updated deployment strategy for the **Health Insurance Prediction** project based on the latest configuration (`Dockerfile`, `.github/workflows/deploy.yml`, and manual processes). 

## 1. Automated Deployment Workflow (GitHub Actions)

According to the updated `.github/workflows/deploy.yml`, the project is set up to automatically build and push to Docker Hub. The workflow triggers on:
- Pushes to the `main` branch.
- Manual execution via `workflow_dispatch`.

The automated pipeline executes the following steps:

### A. Dockerization (Build & Push)
The application relies on a **multi-stage Docker build** (`Dockerfile`) to unify the React frontend and Flask backend into a single image:
1. **Frontend Build Stage** (`node:18-alpine`): Installs NPM dependencies and builds the React application for production.
2. **Backend Setup Stage** (`python:3.11-slim`): 
   - Installs system dependencies (e.g., `libgomp1` for XGBoost/ExtraTrees model support).
   - Installs Python dependencies from `requirements.txt`.
   - Copies the Flask application source code.
   - Copies the compiled React static files from the first stage into `../frontend/build`, enabling Flask to serve both the API and the React frontend.
   - Exposes Port 5000 and sets the default command to run `python app.py`.

Once the image is successfully built, GitHub Actions logs into Docker Hub (using stored repository secrets) and pushes the image under the tag: `dhananjay0901/health-insurance-prediction:latest`.

---

## 2. Manual Redeployment to IBM Cloud

**The automated redeployment steps to IBM Cloud have been completely removed from the pipeline.** 

The reason for this change is not due to missing keys in GitHub Actions, but rather because **the IBM Cloud Account itself does not have the necessary rights and permissions to use the IBM CLI**. Because the account cannot execute CLI commands to update Code Engine applications, the pipeline would always fail if it attempted to run `ibmcloud ce application update`.

Now, the deployment process requires a manual step to go live:

1. **Wait for GitHub Actions**: Ensure the `Build and Push to Docker Hub` GitHub Action completes successfully. This means the latest codebase is now available on Docker Hub at `docker.io/dhananjay0901/health-insurance-prediction:latest`.
2. **Log into IBM Cloud Console**: Open the web browser and log into your IBM Cloud account.
3. **Navigate to Code Engine**: Go to the specific Code Engine project (`a325fdec-3fa4-4e81-babc-c1fd2d2d3032` inside resource group `275edcd99e4b4252a8d2a7805534352a`).
4. **Trigger Update**: Manually update the `health-insurance-prediction` application from the GUI. Since Code Engine uses the Docker Hub registry, updating the app will force it to pull the latest `latest` tagged image that GitHub Actions just pushed.
5. **Verify**: Wait for the new pods to spin up and confirm the changes are live on the public IBM URL.

**Conclusion:** 
The pipeline now cleanly separates responsibilities. CI/CD automation strictly handles creating and publishing the production artifact (the Docker image). The actual continuous delivery/deployment to the live environment is done manually from the IBM Cloud GUI, effectively bypassing the account's CLI permission limitations.

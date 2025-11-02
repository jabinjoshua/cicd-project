pipeline {
    agent any

    environment {
        // --- !!! REPLACE THESE LATER !!! ---
        AWS_ACCOUNT_ID = "680028182286" 
        AWS_REGION     = "ap-south-1"     // e.g., us-east-1
        ECR_REPO_NAME  = "my-simple-app"       // The ECR repo you will create
        DEPLOY_CREDS   = "deploy-server-ssh-key" // Jenkins credential ID you will create
        DEPLOY_HOST    = "ec2-13-235-73-74.ap-south-1.compute.amazonaws.com" // Public DNS of your deployment server
        DEPLOY_USER    = "ec2-user"            // Default for Amazon Linux 2
        // --- You also need to replace the GitHub URL in stage 1 ---
    }
    tools {
        // This name MUST match the name you gave it in Global Tool Configuration
        nodejs 'NodeJS-16' 
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                // --- !!! REPLACE THIS URL !!! ---
                git branch: 'main', url: 'https://github.com/jabinjoshua/cicd-project.git'
            }
        }

        stage('2. Build & Test') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
                echo 'Running tests...'
                sh 'npm test'
            }
        }

        stage('3. Build Docker Image') {
            steps {
                echo 'Building the Docker image...'
                script {
                    // $BUILD_NUMBER is a built-in Jenkins variable
                    dockerImage = docker.build("${ECR_REPO_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('4. Push Image to AWS ECR') {
            steps {
                echo 'Pushing image to ECR...'
                script {
                    def ecrRepoUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    // Assumes the Jenkins server has an IAM Role for ECR access
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRepoUrl}"
                    
                    dockerImage.push("${ecrRepoUrl}/${ECR_REPO_NAME}:${BUILD_NUMBER}")
                    dockerImage.push("${ecrRepoUrl}/${ECR_REPO_NAME}:latest")
                }
            }
        }

        stage('5. Deploy to EC2') {
            steps {
                echo 'Deploying new container to EC2...'
                sshagent(credentials: [DEPLOY_CREDS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                            
                            # Log in to ECR on the deployment server
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                            # Stop and remove the old container
                            docker stop simple-web-app || true
                            docker rm simple-web-app || true

                            # Pull the new image
                            docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest

                            # Run the new container
                            docker run -d --name simple-web-app -p 3000:3000 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest
                        '
                    """
                }
            }
        }
    }
    
    post {
        // Send email notifications
        success {
            echo 'Pipeline succeeded!'
            // Add your mail step here if you want
        }
        failure {
            echo 'Pipeline failed.'
            // Add your mail step here
        }
    }
}
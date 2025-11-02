pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "680028182286" 
        AWS_REGION     = "ap-south-1"     
        ECR_REPO_NAME  = "my-simple-app"     
        DEPLOY_CREDS   = "deploy-server-ssh-key" 
        DEPLOY_HOST    = "ec2-65-2-71-117.ap-south-1.compute.amazonaws.com" 
        DEPLOY_USER    = "ec2-user"         
    }
    tools {
        nodejs 'NodeJS-16' 
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
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
                    dockerImage = docker.build("${ECR_REPO_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('4. Push Image to AWS ECR') {
            steps {
                echo 'Pushing image to ECR...'
                script {
                    def ecrRepoUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    def buildTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                    def latestTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:latest"

                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRepoUrl}"
                    
                    sh "docker tag ${dockerImage.id} ${buildTag}"
                    sh "docker tag ${dockerImage.id} ${latestTag}"

                    sh "docker push ${buildTag}"
                    sh "docker push ${latestTag}"
                }
            }
        }

        stage('5. Deploy to EC2') {
            steps {
                echo 'Deploying new container to EC2...'
                
                script {
                    def buildTag = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                    
                    sshagent(credentials: [DEPLOY_CREDS]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                                
                                # Log in to ECR on the deployment server
                                # We can pass the region and account ID
                                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                                # Stop and remove the old container
                                docker stop simple-web-app || true
                                docker rm simple-web-app || true

                                # Pull the new image using the full tag
                                # The 'buildTag' variable will be expanded by Groovy BEFORE ssh is called
                                docker pull ${buildTag}

                                # Run the new container
                                docker run -d --name simple-web-app -p 3000:3000 ${buildTag}
                            '
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}